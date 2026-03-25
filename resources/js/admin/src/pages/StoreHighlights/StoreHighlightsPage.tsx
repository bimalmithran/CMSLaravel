import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    AlertTriangle,
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
import { Textarea } from '../../../../components/ui/textarea';
import { CrudDialog, DialogFooter } from '../../components/CrudDialog';
import { DataTable } from '../../components/DataTable';
import { MediaPicker } from '../../components/MediaPicker';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { type ApiResponse, apiFetch } from '../../lib/api';
import type {
    PaginatedResponse,
    StoreHighlight,
    StoreHighlightListMeta,
    StoreHighlightPayload,
} from '../../types/storeHighlight';

type FormValues = {
    icon: string;
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
};

function toFormValues(item?: StoreHighlight): FormValues {
    return {
        icon: item?.icon ?? '',
        title: item?.title ?? '',
        description: item?.description ?? '',
        sort_order: item?.sort_order ?? 0,
        is_active: item?.is_active ?? true,
    };
}

function FormBody({
    value,
    onChange,
}: {
    value: FormValues;
    onChange: (next: FormValues) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Icon</Label>
                <MediaPicker
                    value={value.icon}
                    onSelect={(url) => onChange({ ...value, icon: url })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="store-highlight-title">Title</Label>
                <Input
                    id="store-highlight-title"
                    value={value.title}
                    onChange={(e) => onChange({ ...value, title: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="store-highlight-description">Description</Label>
                <Textarea
                    id="store-highlight-description"
                    rows={4}
                    value={value.description}
                    onChange={(e) =>
                        onChange({ ...value, description: e.target.value })
                    }
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="store-highlight-sort-order">Sort Order</Label>
                    <Input
                        id="store-highlight-sort-order"
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
                <div className="flex items-center gap-3 rounded-md border p-3 sm:mt-8">
                    <Checkbox
                        id="store-highlight-active"
                        checked={value.is_active}
                        onCheckedChange={(checked) =>
                            onChange({ ...value, is_active: checked === true })
                        }
                    />
                    <Label
                        htmlFor="store-highlight-active"
                        className="cursor-pointer"
                    >
                        Active
                    </Label>
                </div>
            </div>
        </div>
    );
}

function CreateDialog({
    onCreate,
}: {
    onCreate: (payload: StoreHighlightPayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormValues>(toFormValues());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await onCreate({
                icon: form.icon,
                title: form.title,
                description: form.description,
                sort_order: form.sort_order,
                is_active: form.is_active,
            });
            setOpen(false);
            setForm(toFormValues());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    setError(null);
                    setForm(toFormValues());
                }
            }}
            title="Create Store Highlight"
            size="lg"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Store Highlight
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <FormBody value={form} onChange={setForm} />
                <DialogFooter
                    onCancel={() => setOpen(false)}
                    isSaving={saving}
                    saveText="Create"
                />
            </form>
        </CrudDialog>
    );
}

function EditDialog({
    item,
    open,
    onOpenChange,
    onUpdate,
}: {
    item: StoreHighlight;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: StoreHighlightPayload) => Promise<void>;
}) {
    const [form, setForm] = useState<FormValues>(toFormValues(item));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm(toFormValues(item));
        setError(null);
    }, [item]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await onUpdate(item.id, {
                icon: form.icon,
                title: form.title,
                description: form.description,
                sort_order: form.sort_order,
                is_active: form.is_active,
            });
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Store Highlight"
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <FormBody value={form} onChange={setForm} />
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    isSaving={saving}
                    saveText="Save Changes"
                />
            </form>
        </CrudDialog>
    );
}

function ViewDialog({
    item,
    open,
    onOpenChange,
}: {
    item: StoreHighlight;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="View Store Highlight"
        >
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Icon</div>
                    <div className="mt-1 h-24 w-24 overflow-hidden rounded-md border bg-muted">
                        <img
                            src={item.icon}
                            alt={item.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Title</div>
                    <div>{item.title}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">
                        Description
                    </div>
                    <p>{item.description}</p>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">
                        Sort Order
                    </div>
                    <div>{item.sort_order}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Active</div>
                    <div>{item.is_active ? 'Yes' : 'No'}</div>
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

export function StoreHighlightsPage() {
    const [items, setItems] = useState<StoreHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewItem, setViewItem] = useState<StoreHighlight | null>(null);
    const [editItem, setEditItem] = useState<StoreHighlight | null>(null);
    const [activeCount, setActiveCount] = useState(0);
    const [maxActive, setMaxActive] = useState(4);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);
                if (sorting.length > 0) {
                    params.append('sort_by', sorting[0].id);
                    params.append('sort_dir', sorting[0].desc ? 'desc' : 'asc');
                }

                const res = (await apiFetch<PaginatedResponse<StoreHighlight>>(
                    '/api/v1/admin/store-highlights?' + params.toString(),
                )) as ApiResponse<PaginatedResponse<StoreHighlight>> & {
                    meta?: StoreHighlightListMeta;
                };

                if (!res.success) {
                    setError(res.message || 'Failed to load store highlights');
                    return;
                }

                setItems(res.data.data);
                setCurrentPage(res.data.current_page);
                setLastPage(res.data.last_page);
                setActiveCount(res.meta?.active_count ?? 0);
                setMaxActive(res.meta?.max_active ?? 4);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        },
        [search, sorting],
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function createItem(payload: StoreHighlightPayload) {
        setIsSaving(true);

        try {
            const res = await apiFetch<StoreHighlight>(
                '/api/v1/admin/store-highlights',
                {
                    method: 'POST',
                    json: payload,
                },
            );
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load(1);
        } finally {
            setIsSaving(false);
        }
    }

    async function updateItem(id: number, payload: StoreHighlightPayload) {
        setIsSaving(true);

        try {
            const res = await apiFetch<StoreHighlight>(
                `/api/v1/admin/store-highlights/${id}`,
                {
                    method: 'PUT',
                    json: payload,
                },
            );
            if (!res.success) throw new Error(res.message || 'Update failed');
            await load(currentPage);
        } finally {
            setIsSaving(false);
        }
    }

    const deleteItem = React.useCallback(
        async (item: StoreHighlight) => {
            if (!confirm(`Delete store highlight "${item.title}"?`)) return;
            setIsDeleting(true);

            try {
                const res = await apiFetch<unknown>(
                    `/api/v1/admin/store-highlights/${item.id}`,
                    {
                        method: 'DELETE',
                    },
                );
                if (!res.success) {
                    alert(res.message || 'Delete failed');
                    return;
                }
                await load(currentPage);
            } finally {
                setIsDeleting(false);
            }
        },
        [currentPage, load],
    );

    const columns = useMemo<ColumnDef<StoreHighlight>[]>(
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
                id: 'icon',
                accessorKey: 'icon',
                header: 'Icon',
                cell: ({ row }) => (
                    <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        <img
                            src={row.original.icon}
                            alt={row.original.title}
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
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Title <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'description',
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <p className="max-w-md truncate">{row.original.description}</p>
                ),
            },
            {
                id: 'sort_order',
                accessorKey: 'sort_order',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
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
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 cursor-pointer p-0"
                                    >
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewItem(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditItem(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => void deleteItem(item)}
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
        [deleteItem],
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Store Highlights</div>
                    <div className="text-sm text-muted-foreground">
                        Manage the four trust and selling-point cards shown on the homepage.
                    </div>
                </div>
                <CreateDialog onCreate={createItem} />
            </div>

            {activeCount !== maxActive && (
                <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        Homepage is configured for exactly {maxActive} active store highlights.
                        There are currently {activeCount} active items.
                    </div>
                </div>
            )}

            <DataTable<StoreHighlight, unknown>
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
                emptyMessage="No store highlights found."
                error={error}
                title="List"
            />

            {viewItem && (
                <ViewDialog
                    item={viewItem}
                    open={!!viewItem}
                    onOpenChange={(open) => !open && setViewItem(null)}
                />
            )}
            {editItem && (
                <EditDialog
                    item={editItem}
                    open={!!editItem}
                    onOpenChange={(open) => !open && setEditItem(null)}
                    onUpdate={updateItem}
                />
            )}

            <FullScreenLoader open={isSaving} text="Saving store highlight..." />
            <FullScreenLoader open={isDeleting} text="Deleting store highlight..." />
        </div>
    );
}
