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
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { DataTable } from '../components/DataTable';
import { apiFetch } from '../lib/api';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    image: string | null;
    parent: { id: number; name: string } | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export function CategoriesPage() {
    const [items, setItems] = useState<Category[]>([]);
    const [parents, setParents] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // pagination & sorting state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([]);

    // currently selected items for view/edit dialogs
    const [viewCategory, setViewCategory] = React.useState<Category | null>(null);
    const [editCategory, setEditCategory] = React.useState<Category | null>(null);

    const load = React.useCallback(async (page: number = 1) => {
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

            const res = await apiFetch<Paginated<Category>>(
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
    }, [search, sorting]);

    const loadParents = React.useCallback(async () => {
        const res = await apiFetch<Category[]>('/api/v1/admin/categories/list');
        if (res.success) {
            setParents(res.data);
        }
    }, []);

    useEffect(() => {
        load().catch(console.error);
        loadParents().catch(console.error);
    }, [load, loadParents]);

    async function createCategory(payload: {
        name: string;
        description?: string;
        parent_id?: number | null;
        order?: number;
        is_active?: boolean;
    }) {
        const res = await apiFetch<Category>('/api/v1/admin/categories', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateCategory(
        id: number,
        payload: {
            name: string;
            description?: string;
            parent_id?: number | null;
            order?: number;
            is_active?: boolean;
        },
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
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4 cursor-pointer"
                        >
                            Name
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
            },
            {
                id: 'parent',
                accessorKey: 'parent',
                header: 'Parent',
                cell: ({ row }) => <span className="font-mono text-xs">{row.original.parent?.name ?? '(none)'}</span>,
            },
            {
                id: 'order',
                accessorKey: 'order',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4 cursor-pointer"
                        >
                            Order
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
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
                                        className="h-8 w-8 p-0 cursor-pointer"
                                    >
                                        <span className="sr-only">Open menu</span>
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewCategory(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditCategory(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteCategory(item.id)}
                                    >
                                        <DeleteIcon className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [currentPage]
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

            {/* dialogs triggered by table actions */}
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

function CreateCategoryDialog({
    onCreate,
    parents,
}: {
    parents: Category[];
    onCreate: (payload: {
        name: string;
        description?: string;
        parent_id?: number | null;
        order?: number;
        is_active?: boolean;
    }) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number | ''>('');
    const [order, setOrder] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                order,
                is_active: isActive,
            });
            setOpen(false);
            setName('');
            setDescription('');
            setParentId('');
            setOrder(0);
            setIsActive(true);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">Create</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-desc">Description</Label>
                        <Input
                            id="cat-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-parent">Parent category</Label>
                        <select
                            id="cat-parent"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={parentId}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParentId(v === '' ? '' : Number(v));
                            }}
                        >
                            <option value="">(none)</option>
                            {parents.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="cat-order">Order</Label>
                            <Input
                                id="cat-order"
                                type="number"
                                value={String(order)}
                                onChange={(e) =>
                                    setOrder(Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-active">Active</Label>
                            <Checkbox
                                id="cat-active"
                                checked={isActive}
                                onCheckedChange={(v) => setIsActive(!!v)}
                            />
                        </div>
                    </div>

                    {err ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {err}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={saving} className="cursor-pointer">
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// view-only dialog
function ViewCategoryDialog({
    category,
    open,
    onOpenChange,
}: {
    category: Category;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <strong>Name:</strong> {category.name}
                    </div>
                    <div>
                        <strong>Slug:</strong> {category.slug}
                    </div>
                    <div>
                        <strong>Description:</strong>{' '}
                        {category.description || '—'}
                    </div>
                    <div>
                        <strong>Parent:</strong>{' '}
                        {category.parent?.name ?? '(none)'}
                    </div>
                    <div>
                        <strong>Order:</strong> {category.order}
                    </div>
                    <div>
                        <strong>Active:</strong>{' '}
                        {category.is_active ? 'Yes' : 'No'}
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// edit dialog
function EditCategoryDialog({
    category,
    parents,
    open,
    onOpenChange,
    onUpdate,
}: {
    category: Category;
    parents: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (
        id: number,
        data: {
            name: string;
            description?: string;
            parent_id?: number | null;
            order?: number;
            is_active?: boolean;
        },
    ) => Promise<void>;
}) {
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description);
    const [parentId, setParentId] = useState<number | ''>(
        category.parent_id === null ? '' : category.parent_id,
    );
    const [order, setOrder] = useState<number>(category.order);
    const [isActive, setIsActive] = useState(category.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // reset when category changes (e.g. opening a different item)
    useEffect(() => {
        setName(category.name);
        setDescription(category.description);
        setParentId(category.parent_id === null ? '' : category.parent_id);
        setOrder(category.order);
        setIsActive(category.is_active);
        setErr(null);
    }, [category]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(category.id, {
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                order,
                is_active: isActive,
            });
            onOpenChange(false);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-desc">Description</Label>
                        <Input
                            id="edit-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-parent">Parent Category</Label>
                        <select
                            id="edit-parent"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={parentId}
                            onChange={(e) => {
                                const v = e.target.value;
                                setParentId(v === '' ? '' : Number(v));
                            }}
                        >
                            <option value="">(none)</option>
                            {parents.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="edit-order">Order</Label>
                            <Input
                                id="edit-order"
                                type="number"
                                value={String(order)}
                                onChange={(e) =>
                                    setOrder(Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-active">Active</Label>
                            <Checkbox
                                id="edit-active"
                                checked={isActive}
                                onCheckedChange={(v) => setIsActive(!!v)}
                            />
                        </div>
                    </div>

                    {err ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {err}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}