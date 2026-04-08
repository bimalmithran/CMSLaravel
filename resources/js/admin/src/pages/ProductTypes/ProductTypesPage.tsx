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
import type { ProductType, PaginatedResponse } from '../../types/productType';

import { CreateProductTypeDialog } from './components/CreateProductTypeDialog';
import { EditProductTypeDialog } from './components/EditProductTypeDialog';
import { ViewProductTypeDialog } from './components/ViewProductTypeDialog';

export function ProductTypesPage() {
    const [items, setItems] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([]);

    const [viewProductType, setViewProductType] = React.useState<ProductType | null>(
        null,
    );
    const [editProductType, setEditProductType] = React.useState<ProductType | null>(
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

                const res = await apiFetch<PaginatedResponse<ProductType>>(
                    '/api/v1/admin/product-types?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load product types');
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

    useEffect(() => {
        load().catch(console.error);
    }, [load]);

    async function createProductType(payload: Record<string, unknown>) {
        const res = await apiFetch<ProductType>('/api/v1/admin/product-types', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateProductType(
        id: number,
        payload: Record<string, unknown>,
    ) {
        const res = await apiFetch<ProductType>(`/api/v1/admin/product-types/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteProductType(id: number) {
        if (!confirm('Delete this product type?')) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/product-types/${id}`, {
            method: 'DELETE',
        });
        if (!res.success) {
            alert(res.message || 'Delete failed');
            return;
        }
        await load();
    }

    const columns = useMemo<ColumnDef<ProductType>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                enableHiding: false,
                cell: ({ row, table }) => {
                    const meta = table.options.meta as { currentPage: number };
                    return (meta.currentPage - 1) * 20 + row.index + 1;
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
                id: 'model_name',
                accessorKey: 'model_name',
                header: 'Model Name',
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {row.original.model_name || '-'}
                    </span>
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
                                        onClick={() => setViewProductType(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditProductType(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteProductType(item.id)}
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
                    <div className="text-lg font-semibold">Product Types</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product types and model specifications.
                    </div>
                </div>

                <div className="flex gap-2">
                    <CreateProductTypeDialog
                        onCreate={createProductType}
                    />
                </div>
            </div>

            <DataTable<ProductType, unknown>
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
                emptyMessage="No product types."
                error={error}
                title="List"
            />

            {viewProductType && (
                <ViewProductTypeDialog
                    productType={viewProductType}
                    open={!!viewProductType}
                    onOpenChange={(o) => {
                        if (!o) setViewProductType(null);
                    }}
                />
            )}
            {editProductType && (
                <EditProductTypeDialog
                    productType={editProductType}
                    open={!!editProductType}
                    onOpenChange={(o) => {
                        if (!o) setEditProductType(null);
                    }}
                    onUpdate={updateProductType}
                />
            )}
        </div>
    );
}
