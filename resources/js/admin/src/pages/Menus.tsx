import React, { useEffect, useState } from 'react';

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
import { DataTable, type DataTableColumn } from '../components/DataTable';
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

const menuColumns: DataTableColumn<MenuItem>[] = [
    {
        key: 'index',
        label: '#',
        render: (_value, _item, index, currentPage) =>
            (currentPage - 1) * 10 + index + 1,
    },
    {
        key: 'name',
        label: 'Name',
    },
    {
        key: 'parent',
        label: 'Parent',
        render: (value: unknown) => {
            const parent = value as MenuItem | null;
            return parent?.name ?? '(none)';
        },
    },
    {
        key: 'position',
        label: 'Position',
    },
    {
        key: 'is_active',
        label: 'Active',
        render: (value: unknown) => (value as boolean) ? 'Yes' : 'No',
    },
];

export function MenuPage() {
    const [items, setItems] = React.useState<MenuItem[]>([]);
    const [parents, setParents] = React.useState<MenuItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');

    // pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);

    // currently selected items for view/edit dialogs
    const [viewMenu, setViewMenu] = React.useState<MenuItem | null>(null);
    const [editMenu, setEditMenu] = React.useState<MenuItem | null>(null);

    const load = React.useCallback(async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            if (search) params.append('search', search);

            const res = await apiFetch<PaginatedResponse<MenuItem>>(
                '/api/v1/admin/menus?' + params.toString(),
            );
            if (!res.success) {
                setError(res.message || 'Failed to load menus');
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
    }, [search]);

    const loadParents = React.useCallback(async () => {
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
    }, []);

    useEffect(() => {
        load().catch(console.error);
        loadParents().catch(console.error);
    }, [load, loadParents]);

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
        await load(currentPage);
    }

    async function deleteMenu(item: MenuItem) {
        if (!confirm('Delete this menu item?')) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/menus/${item.id}`, {
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
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">Menus</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product menus.
                    </div>
                </div>
                <CreateMenuDialog onCreate={createMenu} parents={parents} />
            </div>

            <DataTable<MenuItem>
                items={items}
                columns={menuColumns}
                currentPage={currentPage}
                lastPage={lastPage}
                search={search}
                onSearch={setSearch}
                onPageChange={(page) => void load(page)}
                onView={(item) => setViewMenu(item)}
                onEdit={(item) => setEditMenu(item)}
                onDelete={deleteMenu}
                loading={loading}
                emptyMessage="No menus."
                error={error}
                title="List"
            />

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
                        <strong>Parent:</strong> {menu.parent?.name ?? '(none)'}
                    </div>
                    <div>
                        <strong>Position:</strong> {menu.position}
                    </div>
                    <div>
                        <strong>Active:</strong> {menu.is_active ? 'Yes' : 'No'}
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

    async function submit(e: React.SubmitEvent) {
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
