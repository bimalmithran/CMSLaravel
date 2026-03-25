import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { DataTable } from '../../components/DataTable';
import { apiFetch } from '../../lib/api';
import type { PaginatedResponse, Tag, TagPayload } from '../../types/tag';
import { CreateTagDialog } from './components/CreateTagDialog';
import { EditTagDialog } from './components/EditTagDialog';
import { ViewTagDialog } from './components/ViewTagDialog';

export function TagsPage() {
    const [items, setItems] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [viewTag, setViewTag] = useState<Tag | null>(null);
    const [editTag, setEditTag] = useState<Tag | null>(null);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);

                if (sorting.length > 0) {
                    const activeSort = sorting[0];
                    params.append('sort_by', activeSort.id);
                    params.append('sort_dir', activeSort.desc ? 'desc' : 'asc');
                }

                const res = await apiFetch<PaginatedResponse<Tag>>(
                    '/api/v1/admin/tags?' + params.toString(),
                );
                if (!res.success) {
                    throw new Error(res.message || 'Failed to load tags');
                }

                setItems(res.data.data);
                setCurrentPage(res.data.current_page);
                setLastPage(res.data.last_page);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        },
        [search, sorting],
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function createTag(payload: TagPayload) {
        const res = await apiFetch<Tag>('/api/v1/admin/tags', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateTag(id: number, payload: TagPayload) {
        const res = await apiFetch<Tag>(`/api/v1/admin/tags/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteTag(item: Tag) {
        if (!confirm(`Delete tag "${item.name}"?`)) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/tags/${item.id}`, {
            method: 'DELETE',
        });
        if (!res.success) return alert(res.message || 'Delete failed');
        await load(currentPage);
    }

    const columns = useMemo<ColumnDef<Tag>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                enableHiding: false,
                cell: ({ row, table }) => {
                    const meta = table.options.meta as { currentPage: number };
                    return (meta.currentPage - 1) * 10 + row.index + 1;
                },
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'slug',
                accessorKey: 'slug',
                header: 'Slug',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">{row.original.slug}</span>
                ),
            },
            {
                id: 'active',
                accessorKey: 'is_active',
                header: 'Active',
                cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 cursor-pointer p-0"
                                    >
                                        <span className="sr-only">Open menu</span>
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewTag(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditTag(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => void deleteTag(item)}
                                    >
                                        <DeleteIcon className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [currentPage],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">Tags</div>
                    <div className="text-sm text-muted-foreground">
                        Manage reusable product tags like New Arrivals.
                    </div>
                </div>
                <CreateTagDialog onCreate={createTag} />
            </div>

            <DataTable<Tag, unknown>
                data={items}
                columns={columns}
                currentPage={currentPage}
                lastPage={lastPage}
                search={search}
                onSearch={setSearch}
                onPageChange={(page) => void load(page)}
                sorting={sorting}
                onSortingChange={setSorting}
                loading={loading}
                emptyMessage="No tags found."
                error={error}
                title="List"
            />

            {viewTag && (
                <ViewTagDialog
                    tag={viewTag}
                    open={!!viewTag}
                    onOpenChange={(o) => !o && setViewTag(null)}
                />
            )}
            {editTag && (
                <EditTagDialog
                    tag={editTag}
                    open={!!editTag}
                    onOpenChange={(o) => !o && setEditTag(null)}
                    onUpdate={updateTag}
                />
            )}
        </div>
    );
}
