import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { DataTable } from '../components/DataTable';
import { apiFetch } from '../lib/api';
import { Field } from '@/components/ui/field';

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

    // NEW: Add sorting state
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const [currentPage, setCurrentPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);

    const [viewMenu, setViewMenu] = React.useState<MenuItem | null>(null);
    const [editMenu, setEditMenu] = React.useState<MenuItem | null>(null);

    // UPDATE: Modify the load function to include sorting parameters
    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);

                // NEW: Read the active sort column and append to API params
                if (sorting.length > 0) {
                    const activeSort = sorting[0];
                    params.append('sort_by', activeSort.id);
                    params.append('sort_dir', activeSort.desc ? 'desc' : 'asc');
                }

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
        },
        [search, sorting],
    ); // <-- Added sorting to dependencies

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

    // Define columns inside the component so they have access to state setters like setViewMenu
    const columns = useMemo<ColumnDef<MenuItem>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                enableHiding: false, // <-- Prevent hiding the index
                cell: ({ row, table }) => {
                    const meta = table.options.meta as { currentPage: number };
                    return (meta.currentPage - 1) * 10 + row.index + 1;
                },
            },
            {
                id: 'name', // explicitly set ID for the dropdown label
                accessorKey: 'name',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === 'asc',
                                )
                            }
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
                cell: ({ row }) => row.original.parent?.name ?? '(none)',
            },
            {
                id: 'description',
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => row.original.description ?? '(none)',
            },
            {
                id: 'position',
                accessorKey: 'position',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === 'asc',
                                )
                            }
                            className="-ml-4 cursor-pointer"
                        >
                            Position
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
            },
            {
                id: 'active', // Renamed ID from 'is_active' so the dropdown looks cleaner
                accessorKey: 'is_active',
                header: 'Active',
                cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
            },
            {
                id: 'actions',
                enableHiding: false, // <-- Prevent hiding the edit/delete buttons
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
                                        onClick={() => setViewMenu(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditMenu(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteMenu(item)}
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
        [currentPage],
    );

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

            <DataTable<MenuItem, unknown>
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

    async function submit(e: React.FormEvent) {
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
                        <div className="mt-6 flex items-center">
                            <Field
                                orientation="horizontal"
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    id="cat-active"
                                    checked={isActive}
                                    onCheckedChange={(v) => setIsActive(!!v)}
                                />
                                <Label
                                    htmlFor="cat-active"
                                    className="m-0 cursor-pointer font-normal"
                                >
                                    Active
                                </Label>
                            </Field>
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
                        <div className="mt-6 flex items-center">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={isActive}
                                    onCheckedChange={(v) => setIsActive(!!v)}
                                />
                                <Label
                                    htmlFor="edit-active"
                                    className="m-0 cursor-pointer font-normal"
                                >
                                    Active
                                </Label>
                            </div>
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
