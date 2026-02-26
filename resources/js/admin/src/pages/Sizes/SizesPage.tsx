import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

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
import type { Size, SizePayload, PaginatedResponse } from '../../types/size';

import { CreateSizeDialog } from './components/CreateSizeDialog';
import { EditSizeDialog } from './components/EditSizeDialog';
import { ViewSizeDialog } from './components/ViewSizeDialog';

export function SizesPage() {
    const [items, setItems] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [viewSize, setViewSize] = useState<Size | null>(null);
    const [editSize, setEditSize] = useState<Size | null>(null);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ page: String(page) });
                if (search) params.append('search', search);
                if (sorting.length > 0) {
                    params.append('sort_by', sorting[0].id);
                    params.append('sort_dir', sorting[0].desc ? 'desc' : 'asc');
                }

                const res = await apiFetch<PaginatedResponse<Size>>(
                    '/api/v1/admin/sizes?' + params.toString(),
                );
                if (!res.success)
                    throw new Error(res.message || 'Failed to load sizes');

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
        load().catch(console.error);
    }, [load]);

    async function createSize(payload: SizePayload) {
        const res = await apiFetch<Size>('/api/v1/admin/sizes', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateSize(id: number, payload: SizePayload) {
        const res = await apiFetch<Size>(`/api/v1/admin/sizes/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteSize(item: Size) {
        if (!confirm(`Delete size "${item.name}"?`)) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/sizes/${item.id}`, {
            method: 'DELETE',
        });
        if (!res.success) return alert(res.message || 'Delete failed');
        await load();
    }

    const columns = useMemo<ColumnDef<Size>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                enableHiding: false,
                cell: ({ row, table }) =>
                    ((table.options.meta as { currentPage: number })
                        .currentPage -
                        1) *
                        10 +
                    row.index +
                    1,
            },
            {
                id: 'type',
                accessorKey: 'type',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Type <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="capitalize">{row.original.type}</span>
                ),
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
                        Size Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
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
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewSize(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditSize(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteSize(item)}
                                    >
                                        <DeleteIcon className="mr-2 h-4 w-4" />{' '}
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">Sizes</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product variations and sizes.
                    </div>
                </div>
                <CreateSizeDialog onCreate={createSize} />
            </div>

            <DataTable<Size, unknown>
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
                emptyMessage="No sizes found."
                error={error}
                title="List"
            />

            {viewSize && (
                <ViewSizeDialog
                    size={viewSize}
                    open={!!viewSize}
                    onOpenChange={(o) => !o && setViewSize(null)}
                />
            )}
            {editSize && (
                <EditSizeDialog
                    size={editSize}
                    open={!!editSize}
                    onOpenChange={(o) => !o && setEditSize(null)}
                    onUpdate={updateSize}
                />
            )}
        </div>
    );
}
