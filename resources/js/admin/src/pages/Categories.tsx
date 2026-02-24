import {
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '../../../components/ui/input-group';
import { Label } from '../../../components/ui/label';
import { apiFetch } from '../lib/api';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null; // <--- optional parent pointer
    order: number;
    is_active: boolean;
    image: string | null;
    parent: { id: number; name: string } | null; // <--- included parent data
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export function CategoriesPage() {
    const [items, setItems] = useState<Category[]>([]);
    const [parents, setParents] = useState<Category[]>([]); // list for parent dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // currently selected items for view/edit dialogs
    const [viewCategory, setViewCategory] = React.useState<Category | null>(null);
    const [editCategory, setEditCategory] = React.useState<Category | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<Paginated<Category>>(
                '/api/v1/admin/categories?search=' + encodeURIComponent(search),
            );
            if (!res.success) {
                setError(res.message || 'Failed to load categories');
                return;
            }
            setItems(res.data.data);
        } finally {
            setLoading(false);
        }
    }

    // load simple list of all active categories for the parent picker
    async function loadParents() {
        const res = await apiFetch<Category[]>('/api/v1/admin/categories/list');
        if (res.success) {
            setParents(res.data);
        }
    }

    useEffect(() => {
        void load();
        void loadParents();
    }, []);

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
        await load();
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
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await void load();
                                }
                            }}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={async () => await void load()}
                            >
                                Search
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                    <CreateCategoryDialog
                        onCreate={createCategory}
                        parents={parents}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading…
                        </div>
                    ) : error ? (
                        <div className="text-sm text-destructive">{error}</div>
                    ) : items.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No categories.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Parent
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Order
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Active
                                        </th>
                                        <th className="py-2 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((c) => (
                                        <tr key={c.id} className="border-b">
                                            <td className="py-2">{c.name}</td>
                                            <td className="py-2 font-mono text-xs">
                                                {c.parent?.name ?? '(none)'}
                                            </td>
                                            <td className="py-2">{c.order}</td>
                                            <td className="py-2">
                                                {c.is_active ? 'Yes' : 'No'}
                                            </td>
                                            <td className="py-2 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="cursor-pointer"
                                                        >
                                                            <EllipsisVerticalIcon />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                setViewCategory(c)
                                                            }
                                                        >
                                                            <ViewIcon />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                setEditCategory(c)
                                                            }
                                                        >
                                                            <EditIcon />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                deleteCategory(
                                                                    c.id,
                                                                )
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            
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

    async function submit(e: React.SubmitEvent) {
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
                            <Label htmlFor="cat-active">Active (1/0)</Label>
                            <Input
                                id="cat-active"
                                type="number"
                                value={isActive ? '1' : '0'}
                                onChange={(e) =>
                                    setIsActive(e.target.value !== '0')
                                }
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
                        <strong>Description:</strong> {category.description || '—'}
                    </div>
                    <div>
                        <strong>Parent:</strong>{' '}
                        {category.parent?.name ?? '(none)'}
                    </div>
                    <div>
                        <strong>Order:</strong> {category.order}
                    </div>
                    <div>
                        <strong>Active:</strong> {category.is_active ? 'Yes' : 'No'}
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
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

    async function submit(e: React.SubmitEvent) {
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
                    <DialogTitle>Edit Menu</DialogTitle>
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
                            <Label htmlFor="edit-active">Active (1/0)</Label>
                            <Input
                                id="edit-active"
                                type="number"
                                value={isActive ? '1' : '0'}
                                onChange={(e) =>
                                    setIsActive(e.target.value !== '0')
                                }
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
