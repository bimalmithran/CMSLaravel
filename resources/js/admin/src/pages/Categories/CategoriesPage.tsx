import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../../../../components/ui/button';

import { DataTable } from '../../components/DataTable';
import { apiFetch } from '../../lib/api';
import type { Category, PaginatedResponse } from '../../types/category';

import { CreateCategoryDialog } from './components/CreateCategoryDialog';
import { EditCategoryDialog } from './components/EditCategoryDialog';
import { ViewCategoryDialog } from './components/ViewCategoryDialog';

export function CategoriesPage() {
    const [items, setItems] = useState<Category[]>([]);
    const [parents, setParents] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([]);

    const [viewCategory, setViewCategory] = React.useState<Category | null>(
        null,
    );
    const [editCategory, setEditCategory] = React.useState<Category | null>(
        null,
    );

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

                const res = await apiFetch<PaginatedResponse<Category>>(
                    '/api/v1/admin/categories?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load categories');
                    return;
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

    const loadParents = React.useCallback(async () => {
        try {
            const res = await apiFetch<Category[]>(
                '/api/v1/admin/categories/list',
            );
            if (res.success) {
                setParents(res.data);
            }
        } catch (err) {
            console.error('Failed to load parent categories', err);
        }
    }, []);

    useEffect(() => {
        load().catch(console.error);
        loadParents().catch(console.error);
    }, [load, loadParents]);

    async function createCategory(payload: Record<string, unknown>) {
        const res = await apiFetch<Category>('/api/v1/admin/categories', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateCategory(
        id: number,
        payload: Record<string, unknown>,
    ) {
        const res = await apiFetch<Category>(`/api/v1/admin/categories/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteCategory(id: number) {
        if (!confirm('Delete this category?')) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/categories/${id}`, {
            method: 'DELETE',
        });
        if (!res.success) {
            alert(res.message || 'Delete failed');
            return;
        }
        await load();
    }

    const columns = useMemo<ColumnDef<Category>[]>(
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
                id: 'parent',
                accessorKey: 'parent',
                header: 'Parent',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">
                        {row.original.parent?.name ?? '(none)'}
                    </span>
                ),
            },
            {
                id: 'order',
                accessorKey: 'order',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Order <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
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
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewCategory(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditCategory(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteCategory(item.id)}
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Categories</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product categories.
                    </div>
                </div>

                <div className="flex gap-2">
                    <CreateCategoryDialog
                        onCreate={createCategory}
                        parents={parents}
                    />
                </div>
            </div>

            <DataTable<Category, unknown>
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
                emptyMessage="No categories."
                error={error}
                title="List"
            />

            {viewCategory && (
                <ViewCategoryDialog
                    category={viewCategory}
                    open={!!viewCategory}
                    onOpenChange={(o) => {
                        if (!o) setViewCategory(null);
                    }}
                />
            )}
            {editCategory && (
                <EditCategoryDialog
                    category={editCategory}
                    parents={parents}
                    open={!!editCategory}
                    onOpenChange={(o) => {
                        if (!o) setEditCategory(null);
                    }}
                    onUpdate={updateCategory}
                />
            )}
        </div>
    );
}
