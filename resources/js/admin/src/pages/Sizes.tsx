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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

import { CrudDialog, DialogFooter } from '../components/CrudDialog';
import { DataTable } from '../components/DataTable';
import { apiFetch } from '../lib/api';

type Size = {
    id: number;
    name: string;
    type: string;
};

type SizePayload = {
    name: string;
    type: string;
};

type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

// Hardcoded types to keep the UI clean
const SIZE_TYPES = ['ring', 'bangle', 'chain', 'necklace', 'bracelet', 'watch'];

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
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);

                if (sorting.length > 0) {
                    const activeSort = sorting[0];
                    params.append('sort_by', activeSort.id);
                    params.append('sort_dir', activeSort.desc ? 'desc' : 'asc');
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
                cell: ({ row, table }) => {
                    const meta = table.options.meta as { currentPage: number };
                    return (meta.currentPage - 1) * 10 + row.index + 1;
                },
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
                                        <span className="sr-only">
                                            Open menu
                                        </span>
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

// --- DIALOGS ---

function CreateSizeDialog({
    onCreate,
}: {
    onCreate: (data: SizePayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState(SIZE_TYPES[0]);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({ name, type });
            setOpen(false);
            setName('');
            setType(SIZE_TYPES[0]);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={setOpen}
            title="Create Size"
            trigger={<Button className="cursor-pointer">Create</Button>}
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="size-type">Category / Type</Label>
                    <select
                        id="size-type"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm capitalize"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {SIZE_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="size-name">
                        Size Name (e.g. 2.4, Size 14)
                    </Label>
                    <Input
                        id="size-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                {err && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {err}
                    </div>
                )}
                <DialogFooter
                    onCancel={() => setOpen(false)}
                    isSaving={saving}
                />
            </form>
        </CrudDialog>
    );
}

function ViewSizeDialog({
    size,
    open,
    onOpenChange,
}: {
    size: Size;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Size">
            <div className="space-y-4">
                <div>
                    <strong>Type:</strong>{' '}
                    <span className="capitalize">{size.type}</span>
                </div>
                <div>
                    <strong>Name:</strong> {size.name}
                </div>
            </div>
            <DialogFooter
                onCancel={() => onOpenChange(false)}
                showSave={false}
                cancelText="Close"
            />
        </CrudDialog>
    );
}

function EditSizeDialog({
    size,
    open,
    onOpenChange,
    onUpdate,
}: {
    size: Size;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: SizePayload) => Promise<void>;
}) {
    const [name, setName] = useState(size.name);
    const [type, setType] = useState(size.type);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(size.name);
        setType(size.type);
        setErr(null);
    }, [size]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(size.id, { name, type });
            onOpenChange(false);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Size">
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="edit-type">Category / Type</Label>
                    <select
                        id="edit-type"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm capitalize"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {SIZE_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Size Name</Label>
                    <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                {err && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {err}
                    </div>
                )}
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    isSaving={saving}
                />
            </form>
        </CrudDialog>
    );
}
