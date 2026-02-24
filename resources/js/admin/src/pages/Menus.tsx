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

type MenuItem = {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    position: number;
    parent_id: number | null;
    parent: MenuItem | null;
};

type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export function MenuPage() {
    const [items, setItems] = React.useState<MenuItem[]>([]);
    const [parents, setParents] = React.useState<MenuItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');

    // currently selected items for view/edit dialogs
    const [viewMenu, setViewMenu] = React.useState<MenuItem | null>(null);
    const [editMenu, setEditMenu] = React.useState<MenuItem | null>(null);

    useEffect(() => {
        void load();
        void loadParents();
    }, []);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<PaginatedResponse<MenuItem>>(
                '/api/v1/admin/menus?search=' + encodeURIComponent(search),
            );
            if (!res.success) {
                setError(res.message || 'Failed to load menus');
                return;
            }
            setItems(res.data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    async function loadParents() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<MenuItem[]>('/api/v1/admin/menus/list');
            if (!res.success) {
                setError(res.message || 'Failed to load parent menus');
                return;
            }
            setParents(res.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    async function createMenu(payload: {
        name: string;
        description?: string;
        parent_id?: number | null;
        position?: number;
        is_active?: boolean;
    }) {
        const res = await apiFetch<MenuItem>('/api/v1/admin/menus', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateMenu(
        id: number,
        payload: {
            name: string;
            description?: string;
            parent_id?: number | null;
            position?: number;
            is_active?: boolean;
        },
    ) {
        const res = await apiFetch<MenuItem>(`/api/v1/admin/menus/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load();
    }

    async function deleteMenu(id: number) {
        if (!confirm('Delete this menu item?')) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/menus/${id}`, {
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
                    <div className="text-lg font-semibold">Menus</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product menus.
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
                    <CreateMenuDialog onCreate={createMenu} parents={parents} />
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
                            No menus.
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
                                            Position
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
                                            <td className="py-2">
                                                {c.position}
                                            </td>
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
                                                            onClick={() => setViewMenu(c)}
                                                        >
                                                            <ViewIcon />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => setEditMenu(c)}
                                                        >
                                                            <EditIcon />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                deleteMenu(c.id)
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
            {viewMenu && (
                <ViewMenuDialog
                    menu={viewMenu}
                    open={!!viewMenu}
                    onOpenChange={(o) => {
                        if (!o) setViewMenu(null);
                    }}
                />
            )}
            {editMenu && (
                <EditMenuDialog
                    menu={editMenu}
                    parents={parents}
                    open={!!editMenu}
                    onOpenChange={(o) => {
                        if (!o) setEditMenu(null);
                    }}
                    onUpdate={updateMenu}
                />
            )}
        </div>
    );
}

function CreateMenuDialog({
    onCreate,
    parents,
}: {
    onCreate: (data: {
        name: string;
        description?: string;
        is_active: boolean;
        position: number;
        parent_id: number | null;
    }) => Promise<void>;
    parents: MenuItem[];
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number | ''>('');
    const [position, setPosition] = useState<number>(0);
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
                position,
                is_active: isActive,
            });
            setOpen(false);
            setName('');
            setDescription('');
            setParentId('');
            setPosition(0);
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
                    <DialogTitle>Create Menu</DialogTitle>
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
                        <Label htmlFor="cat-parent">Parent Menu</Label>
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
                            <Label htmlFor="cat-order">Position</Label>
                            <Input
                                id="cat-order"
                                type="number"
                                value={String(position)}
                                onChange={(e) =>
                                    setPosition(Number(e.target.value))
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
function ViewMenuDialog({
    menu,
    open,
    onOpenChange,
}: {
    menu: MenuItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View Menu</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <strong>Name:</strong> {menu.name}
                    </div>
                    <div>
                        <strong>Slug:</strong> {menu.slug}
                    </div>
                    <div>
                        <strong>Description:</strong> {menu.description || '—'}
                    </div>
                    <div>
                        <strong>Parent:</strong>{' '}
                        {menu.parent?.name ?? '(none)'}
                    </div>
                    <div>
                        <strong>Position:</strong> {menu.position}
                    </div>
                    <div>
                        <strong>Active:</strong> {menu.is_active ? 'Yes' : 'No'}
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
function EditMenuDialog({
    menu,
    parents,
    open,
    onOpenChange,
    onUpdate,
}: {
    menu: MenuItem;
    parents: MenuItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (
        id: number,
        data: {
            name: string;
            description?: string;
            parent_id?: number | null;
            position?: number;
            is_active?: boolean;
        },
    ) => Promise<void>;
}) {
    const [name, setName] = useState(menu.name);
    const [description, setDescription] = useState(menu.description);
    const [parentId, setParentId] = useState<number | ''>(
        menu.parent_id === null ? '' : menu.parent_id,
    );
    const [position, setPosition] = useState<number>(menu.position);
    const [isActive, setIsActive] = useState(menu.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // reset when menu changes (e.g. opening a different item)
    useEffect(() => {
        setName(menu.name);
        setDescription(menu.description);
        setParentId(menu.parent_id === null ? '' : menu.parent_id);
        setPosition(menu.position);
        setIsActive(menu.is_active);
        setErr(null);
    }, [menu]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(menu.id, {
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                position,
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
                        <Label htmlFor="edit-parent">Parent Menu</Label>
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
                            <Label htmlFor="edit-position">Position</Label>
                            <Input
                                id="edit-position"
                                type="number"
                                value={String(position)}
                                onChange={(e) =>
                                    setPosition(Number(e.target.value))
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
