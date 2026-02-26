import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

import { Field } from '@/components/ui/field';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
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
import { MediaPicker } from '../components/MediaPicker';
import { apiFetch } from '../lib/api';

type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    is_active: boolean;
};

type BrandPayload = {
    name: string;
    logo?: string | null;
    is_active: boolean;
};

type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export function BrandsPage() {
    const [items, setItems] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [viewBrand, setViewBrand] = useState<Brand | null>(null);
    const [editBrand, setEditBrand] = useState<Brand | null>(null);

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

                const res = await apiFetch<PaginatedResponse<Brand>>(
                    '/api/v1/admin/brands?' + params.toString(),
                );
                if (!res.success)
                    throw new Error(res.message || 'Failed to load brands');

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

    async function createBrand(payload: BrandPayload) {
        const res = await apiFetch<Brand>('/api/v1/admin/brands', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateBrand(id: number, payload: BrandPayload) {
        const res = await apiFetch<Brand>(`/api/v1/admin/brands/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteBrand(item: Brand) {
        if (!confirm(`Delete brand "${item.name}"?`)) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/brands/${item.id}`, {
            method: 'DELETE',
        });
        if (!res.success) return alert(res.message || 'Delete failed');
        await load();
    }

    const columns = useMemo<ColumnDef<Brand>[]>(
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
                id: 'logo',
                header: 'Logo',
                cell: ({ row }) =>
                    row.original.logo ? (
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                                src={row.original.logo}
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
                                        onClick={() => setViewBrand(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditBrand(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteBrand(item)}
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
                    <div className="text-lg font-semibold">Brands</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product brands and collections.
                    </div>
                </div>
                <CreateBrandDialog onCreate={createBrand} />
            </div>

            <DataTable<Brand, unknown>
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
                emptyMessage="No brands found."
                error={error}
                title="List"
            />

            {viewBrand && (
                <ViewBrandDialog
                    brand={viewBrand}
                    open={!!viewBrand}
                    onOpenChange={(o) => !o && setViewBrand(null)}
                />
            )}
            {editBrand && (
                <EditBrandDialog
                    brand={editBrand}
                    open={!!editBrand}
                    onOpenChange={(o) => !o && setEditBrand(null)}
                    onUpdate={updateBrand}
                />
            )}
        </div>
    );
}

// --- DIALOGS ---

function CreateBrandDialog({
    onCreate,
}: {
    onCreate: (data: BrandPayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({ name, logo: logo || null, is_active: isActive });
            setOpen(false);
            setName('');
            setLogo('');
            setIsActive(true);
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
            title="Create Brand"
            trigger={<Button className="cursor-pointer">Create</Button>}
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="brand-name">Name</Label>
                    <Input
                        id="brand-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Brand Logo</Label>
                    <MediaPicker value={logo} onSelect={setLogo} />
                </div>
                <div className="mt-4 flex items-center">
                    <Field
                        orientation="horizontal"
                        className="flex items-center gap-2"
                    >
                        <Checkbox
                            id="brand-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label
                            htmlFor="brand-active"
                            className="m-0 cursor-pointer font-normal"
                        >
                            Active
                        </Label>
                    </Field>
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

function ViewBrandDialog({
    brand,
    open,
    onOpenChange,
}: {
    brand: Brand;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Brand">
            <div className="space-y-4">
                <div>
                    <strong>Logo:</strong>
                    {brand.logo ? (
                        <div className="mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <span className="ml-2 text-muted-foreground">
                            (none)
                        </span>
                    )}
                </div>
                <div>
                    <strong>Name:</strong> {brand.name}
                </div>
                <div>
                    <strong>Slug:</strong> {brand.slug}
                </div>
                <div>
                    <strong>Active:</strong> {brand.is_active ? 'Yes' : 'No'}
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

function EditBrandDialog({
    brand,
    open,
    onOpenChange,
    onUpdate,
}: {
    brand: Brand;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: BrandPayload) => Promise<void>;
}) {
    const [name, setName] = useState(brand.name);
    const [logo, setLogo] = useState(brand.logo || '');
    const [isActive, setIsActive] = useState(brand.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(brand.name);
        setLogo(brand.logo || '');
        setIsActive(brand.is_active);
        setErr(null);
    }, [brand]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(brand.id, {
                name,
                logo: logo || null,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Brand">
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
                    <Label>Brand Logo</Label>
                    <MediaPicker value={logo} onSelect={setLogo} />
                </div>
                <div className="mt-4 flex items-center">
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
