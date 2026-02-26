import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
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
import type {
    Product,
    PaginatedResponse,
    LookupItem,
    ProductTypeItem,
} from '../../types/product';

import { CreateProductDialog } from './components/CreateProductDialog';
import { EditProductDialog } from './components/EditProductDialog';
import { ViewProductDialog } from './components/ViewProductDialog'; // ADDED IMPORT

export function ProductsPage() {
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [categories, setCategories] = useState<LookupItem[]>([]);
    const [brands, setBrands] = useState<LookupItem[]>([]);
    const [productTypes, setProductTypes] = useState<ProductTypeItem[]>([]);

    // Added viewProduct state
    const [viewProduct, setViewProduct] = useState<Product | null>(null);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ page: String(page) });
                if (search) params.append('search', search);
                if (sorting.length > 0) {
                    params.append('sort_by', sorting[0].id);
                    params.append('sort_dir', sorting[0].desc ? 'desc' : 'asc');
                }

                const res = await apiFetch<PaginatedResponse<Product>>(
                    '/api/v1/admin/products?' + params.toString(),
                );
                if (res.success) {
                    setItems(res.data.data);
                    setCurrentPage(res.data.current_page);
                    setLastPage(res.data.last_page);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setLoading(false);
            }
        },
        [search, sorting],
    );

    const loadDependencies = React.useCallback(async () => {
        try {
            // Removed sizes API call to fix the unused variable error
            const [catRes, brandRes, typeRes] = await Promise.all([
                apiFetch<LookupItem[]>('/api/v1/admin/categories/list'),
                apiFetch<{ data: LookupItem[] }>('/api/v1/admin/brands'),
                apiFetch<ProductTypeItem[]>('/api/v1/admin/product-types/list'),
            ]);

            if (catRes.success) setCategories(catRes.data);
            if (brandRes.success) setBrands(brandRes.data.data);
            if (typeRes.success) setProductTypes(typeRes.data);
        } catch (err) {
            console.error('Failed to load dependencies', err);
        }
    }, []);

    useEffect(() => {
        load().catch(console.error);
        loadDependencies().catch(console.error);
    }, [load, loadDependencies]);

    async function createProduct(payload: Record<string, unknown>) {
        const res = await apiFetch<Product>('/api/v1/admin/products', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateProduct(id: number, payload: Record<string, unknown>) {
        const res = await apiFetch<Product>(`/api/v1/admin/products/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteProduct(item: Product) {
        if (!confirm(`Delete product "${item.name}"?`)) return;
        const res = await apiFetch<unknown>(
            `/api/v1/admin/products/${item.id}`,
            { method: 'DELETE' },
        );
        if (!res.success) return alert(res.message || 'Delete failed');
        await load();
    }

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                id: 'image',
                header: 'Image',
                cell: ({ row }) =>
                    row.original.image ? (
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                                src={row.original.image}
                                alt={row.original.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            None
                        </span>
                    ),
            },
            { id: 'name', accessorKey: 'name', header: 'Product Name' },
            {
                id: 'sku',
                accessorKey: 'sku',
                header: 'SKU',
                cell: ({ row }) => (
                    <span className="font-mono text-xs">
                        {row.original.sku}
                    </span>
                ),
            },
            {
                id: 'type',
                header: 'Type',
                cell: ({ row }) => (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {row.original.productType?.name}
                    </span>
                ),
            },
            {
                id: 'price',
                accessorKey: 'price',
                header: 'Price',
                cell: ({ row }) =>
                    `₹${Number(row.original.price).toLocaleString('en-IN')}`,
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
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {/* ADDED VIEW MENU ITEM */}
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewProduct(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditProduct(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteProduct(item)}
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
                    <div className="text-lg font-semibold">Products</div>
                    <div className="text-sm text-muted-foreground">
                        Manage your catalog, specs, and variations.
                    </div>
                </div>
                <CreateProductDialog
                    onCreate={createProduct}
                    categories={categories}
                    brands={brands}
                    productTypes={productTypes}
                />
            </div>

            <DataTable<Product, unknown>
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
                emptyMessage="No products found."
                error={error}
                title="Catalog"
            />

            {/* ADDED VIEW DIALOG */}
            {viewProduct && (
                <ViewProductDialog
                    product={viewProduct}
                    open={!!viewProduct}
                    onOpenChange={(o) => !o && setViewProduct(null)}
                />
            )}

            {editProduct && (
                <EditProductDialog
                    product={editProduct}
                    onUpdate={updateProduct}
                    open={!!editProduct}
                    onOpenChange={(o) => !o && setEditProduct(null)}
                    categories={categories}
                    brands={brands}
                    productTypes={productTypes}
                />
            )}
        </div>
    );
}
