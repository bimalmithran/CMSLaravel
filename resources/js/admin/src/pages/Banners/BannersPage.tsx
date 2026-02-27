import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    Plus,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { CrudDialog, DialogFooter } from '../../components/CrudDialog';
import { DataTable } from '../../components/DataTable';
import { MediaPicker } from '../../components/MediaPicker';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { apiFetch } from '../../lib/api';
import type { Banner, BannerPayload, PaginatedResponse } from '../../types/banner';

const PLACEMENT_OPTIONS = [
    { value: 'homepage_hero', label: 'Homepage Hero' },
    { value: 'homepage_sidebar', label: 'Homepage Sidebar' },
    { value: 'checkout_sidebar', label: 'Checkout Sidebar' },
    { value: 'category_top', label: 'Category Top' },
];

type BannerFormValues = {
    title: string;
    subtitle: string;
    action_url: string;
    image_path: string;
    placement: string;
    sort_order: number;
    is_active: boolean;
};

function toFormValues(item?: Banner): BannerFormValues {
    return {
        title: item?.title ?? '',
        subtitle: item?.subtitle ?? '',
        action_url: item?.action_url ?? '',
        image_path: item?.image_path ?? '',
        placement: item?.placement ?? 'homepage_hero',
        sort_order: item?.sort_order ?? 0,
        is_active: item?.is_active ?? true,
    };
}

function BannerForm({
    value,
    onChange,
}: {
    value: BannerFormValues;
    onChange: (next: BannerFormValues) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="banner-title">Title</Label>
                    <Input
                        id="banner-title"
                        value={value.title}
                        onChange={(e) => onChange({ ...value, title: e.target.value })}
                        placeholder="Summer Sale 2026"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner-placement">Placement</Label>
                    <Select
                        value={value.placement}
                        onValueChange={(placement) => onChange({ ...value, placement })}
                    >
                        <SelectTrigger id="banner-placement">
                            <SelectValue placeholder="Select placement" />
                        </SelectTrigger>
                        <SelectContent>
                            {PLACEMENT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="banner-subtitle">Subtitle</Label>
                <Textarea
                    id="banner-subtitle"
                    value={value.subtitle}
                    onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
                    placeholder="Up to 50% off on Diamond Rings"
                    rows={3}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="banner-action-url">Action URL</Label>
                    <Input
                        id="banner-action-url"
                        value={value.action_url}
                        onChange={(e) => onChange({ ...value, action_url: e.target.value })}
                        placeholder="https://example.com/sale"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="banner-sort-order">Sort Order</Label>
                    <Input
                        id="banner-sort-order"
                        type="number"
                        min={0}
                        value={value.sort_order}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                sort_order: Number(e.target.value || 0),
                            })
                        }
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Banner Image</Label>
                <MediaPicker
                    value={value.image_path}
                    onSelect={(url) => onChange({ ...value, image_path: url })}
                />
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                    id="banner-active"
                    checked={value.is_active}
                    onCheckedChange={(checked) =>
                        onChange({ ...value, is_active: checked === true })
                    }
                />
                <Label htmlFor="banner-active" className="cursor-pointer">
                    Active
                </Label>
            </div>
        </div>
    );
}

function CreateBannerDialog({
    onCreate,
}: {
    onCreate: (payload: BannerPayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<BannerFormValues>(toFormValues());

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await onCreate({
                title: form.title || null,
                subtitle: form.subtitle || null,
                action_url: form.action_url || null,
                image_path: form.image_path,
                placement: form.placement,
                sort_order: form.sort_order,
                is_active: form.is_active,
            });
            setOpen(false);
            setForm(toFormValues());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create banner');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) {
                    setError(null);
                    setForm(toFormValues());
                }
            }}
            title="Create Banner"
            size="lg"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Banner
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <BannerForm value={form} onChange={setForm} />
                <DialogFooter
                    onCancel={() => setOpen(false)}
                    isSaving={submitting}
                    saveText="Create Banner"
                />
            </form>
        </CrudDialog>
    );
}

function EditBannerDialog({
    banner,
    open,
    onOpenChange,
    onUpdate,
}: {
    banner: Banner;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: BannerPayload) => Promise<void>;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<BannerFormValues>(toFormValues(banner));

    useEffect(() => {
        setForm(toFormValues(banner));
        setError(null);
    }, [banner]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await onUpdate(banner.id, {
                title: form.title || null,
                subtitle: form.subtitle || null,
                action_url: form.action_url || null,
                image_path: form.image_path,
                placement: form.placement,
                sort_order: form.sort_order,
                is_active: form.is_active,
            });
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update banner');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Banner"
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <BannerForm value={form} onChange={setForm} />
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    isSaving={submitting}
                    saveText="Save Changes"
                />
            </form>
        </CrudDialog>
    );
}

function ViewBannerDialog({
    banner,
    open,
    onOpenChange,
}: {
    banner: Banner;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Banner">
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Title</div>
                    <div>{banner.title || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Subtitle</div>
                    <div>{banner.subtitle || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Placement</div>
                    <div className="font-mono">{banner.placement}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Action URL</div>
                    <div className="break-all font-mono">
                        {banner.action_url || '(none)'}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Sort / Active</div>
                    <div>
                        {banner.sort_order} / {banner.is_active ? 'Yes' : 'No'}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Image</div>
                    <div className="mt-1 h-32 w-full overflow-hidden rounded-md border bg-muted">
                        <img
                            src={banner.image_path}
                            alt={banner.title || 'Banner image'}
                            className="h-full w-full object-cover"
                        />
                    </div>
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

export function BannersPage() {
    const [items, setItems] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [placementFilter, setPlacementFilter] = useState('all');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewBanner, setViewBanner] = useState<Banner | null>(null);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);
                if (placementFilter !== 'all') params.append('placement', placementFilter);

                if (sorting.length > 0) {
                    const activeSort = sorting[0];
                    params.append('sort_by', activeSort.id);
                    params.append('sort_dir', activeSort.desc ? 'desc' : 'asc');
                }

                const res = await apiFetch<PaginatedResponse<Banner>>(
                    '/api/v1/admin/banners?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load banners');
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
        [search, placementFilter, sorting],
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function createBanner(payload: BannerPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Banner>('/api/v1/admin/banners', {
                method: 'POST',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load();
        } finally {
            setIsSaving(false);
        }
    }

    async function updateBanner(id: number, payload: BannerPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Banner>(`/api/v1/admin/banners/${id}`, {
                method: 'PUT',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Update failed');
            await load(currentPage);
        } finally {
            setIsSaving(false);
        }
    }

    const deleteBanner = React.useCallback(async (item: Banner) => {
        if (!confirm(`Delete banner "${item.title || item.id}"?`)) return;
        setIsDeleting(true);
        try {
            const res = await apiFetch<unknown>(`/api/v1/admin/banners/${item.id}`, {
                method: 'DELETE',
            });
            if (!res.success) {
                alert(res.message || 'Delete failed');
                return;
            }
            await load(currentPage);
        } finally {
            setIsDeleting(false);
        }
    }, [currentPage, load]);

    const columns = useMemo<ColumnDef<Banner>[]>(
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
                id: 'image',
                header: 'Image',
                cell: ({ row }) => (
                    <div className="h-10 w-16 overflow-hidden rounded border bg-muted">
                        <img
                            src={row.original.image_path}
                            alt={row.original.title || 'Banner'}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ),
            },
            {
                id: 'title',
                accessorKey: 'title',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => row.original.title || '(untitled)',
            },
            {
                id: 'placement',
                accessorKey: 'placement',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Placement <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <span className="font-mono text-xs">{row.original.placement}</span>,
            },
            {
                id: 'sort_order',
                accessorKey: 'sort_order',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Order <ArrowUpDown className="ml-2 h-4 w-4" />
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
                                    <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
                                        <span className="sr-only">Open menu</span>
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewBanner(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditBanner(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => void deleteBanner(item)}
                                    >
                                        <DeleteIcon className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [deleteBanner],
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Banners</div>
                    <div className="text-sm text-muted-foreground">
                        Manage hero sliders and promotional banners by placement.
                    </div>
                </div>
                <CreateBannerDialog onCreate={createBanner} />
            </div>

            <div className="flex items-center gap-2">
                <Label htmlFor="placement-filter" className="text-sm text-muted-foreground">
                    Placement
                </Label>
                <Select value={placementFilter} onValueChange={setPlacementFilter}>
                    <SelectTrigger id="placement-filter" className="w-[240px]">
                        <SelectValue placeholder="All placements" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All placements</SelectItem>
                        {PLACEMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable<Banner, unknown>
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
                emptyMessage="No banners found."
                error={error}
                title="List"
            />

            {viewBanner && (
                <ViewBannerDialog
                    banner={viewBanner}
                    open={!!viewBanner}
                    onOpenChange={(open) => !open && setViewBanner(null)}
                />
            )}

            {editBanner && (
                <EditBannerDialog
                    banner={editBanner}
                    open={!!editBanner}
                    onOpenChange={(open) => !open && setEditBanner(null)}
                    onUpdate={updateBanner}
                />
            )}

            <FullScreenLoader open={isSaving} text="Saving banner..." />
            <FullScreenLoader open={isDeleting} text="Deleting banner..." />
        </div>
    );
}
