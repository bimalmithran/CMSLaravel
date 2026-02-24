import {
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
import { Label } from '../../../components/ui/label';
import { apiFetch } from '../lib/api';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
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

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.slug.toLowerCase().includes(q),
        );
    }, [items, search]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<Paginated<Category>>(
                '/api/v1/admin/categories',
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
                    <Input
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
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
                    ) : filtered.length === 0 ? (
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
                                    {filtered.map((c) => (
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
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <ViewIcon />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
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
