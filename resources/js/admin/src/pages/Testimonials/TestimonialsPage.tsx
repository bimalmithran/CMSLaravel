import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    Plus,
    Star,
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
import { apiFetch } from '../../lib/api';
import type {
    PaginatedResponse,
    Testimonial,
    TestimonialPayload,
} from '../../types/testimonial';

type FormValues = {
    customer_name: string;
    designation_or_location: string;
    content: string;
    rating: number;
    image_path: string;
    sort_order: number;
    is_active: boolean;
};

function toFormValues(item?: Testimonial): FormValues {
    return {
        customer_name: item?.customer_name ?? '',
        designation_or_location: item?.designation_or_location ?? '',
        content: item?.content ?? '',
        rating: item?.rating ?? 5,
        image_path: item?.image_path ?? '',
        sort_order: item?.sort_order ?? 0,
        is_active: item?.is_active ?? true,
    };
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                />
            ))}
        </div>
    );
}

function FormBody({ value, onChange }: { value: FormValues; onChange: (next: FormValues) => void }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="testimonial-name">Customer Name</Label>
                    <Input
                        id="testimonial-name"
                        value={value.customer_name}
                        onChange={(e) => onChange({ ...value, customer_name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="testimonial-designation">Designation / Location</Label>
                    <Input
                        id="testimonial-designation"
                        value={value.designation_or_location}
                        onChange={(e) =>
                            onChange({ ...value, designation_or_location: e.target.value })
                        }
                        placeholder="Verified Buyer / Mumbai, IN"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="testimonial-content">Review Content</Label>
                <Textarea
                    id="testimonial-content"
                    rows={5}
                    value={value.content}
                    onChange={(e) => onChange({ ...value, content: e.target.value })}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="testimonial-rating">Rating (1-5)</Label>
                    <Input
                        id="testimonial-rating"
                        type="number"
                        min={1}
                        max={5}
                        value={value.rating}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                rating: Math.max(1, Math.min(5, Number(e.target.value || 1))),
                            })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="testimonial-sort">Sort Order</Label>
                    <Input
                        id="testimonial-sort"
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
                <Label>Image</Label>
                <MediaPicker
                    value={value.image_path}
                    onSelect={(url) => onChange({ ...value, image_path: url })}
                />
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                    id="testimonial-active"
                    checked={value.is_active}
                    onCheckedChange={(checked) =>
                        onChange({ ...value, is_active: checked === true })
                    }
                />
                <Label htmlFor="testimonial-active" className="cursor-pointer">
                    Active
                </Label>
            </div>
        </div>
    );
}

function CreateDialog({ onCreate }: { onCreate: (payload: TestimonialPayload) => Promise<void> }) {
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
                customer_name: form.customer_name,
                designation_or_location: form.designation_or_location || null,
                content: form.content,
                rating: form.rating,
                image_path: form.image_path || null,
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
            title="Create Testimonial"
            size="lg"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Testimonial
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
                <DialogFooter onCancel={() => setOpen(false)} isSaving={saving} saveText="Create" />
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
    item: Testimonial;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: TestimonialPayload) => Promise<void>;
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
                customer_name: form.customer_name,
                designation_or_location: form.designation_or_location || null,
                content: form.content,
                rating: form.rating,
                image_path: form.image_path || null,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Testimonial" size="lg">
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
    item: Testimonial;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Testimonial">
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Customer</div>
                    <div>{item.customer_name}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Designation / Location</div>
                    <div>{item.designation_or_location || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <Stars rating={item.rating} />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Content</div>
                    <p>{item.content}</p>
                </div>
                {item.image_path && (
                    <div>
                        <div className="text-xs text-muted-foreground">Image</div>
                        <div className="mt-1 h-40 overflow-hidden rounded-md border bg-muted">
                            <img src={item.image_path} alt={item.customer_name} className="h-full w-full object-cover" />
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter onCancel={() => onOpenChange(false)} showSave={false} cancelText="Close" />
        </CrudDialog>
    );
}

export function TestimonialsPage() {
    const [items, setItems] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewItem, setViewItem] = useState<Testimonial | null>(null);
    const [editItem, setEditItem] = useState<Testimonial | null>(null);

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

                const res = await apiFetch<PaginatedResponse<Testimonial>>(
                    '/api/v1/admin/testimonials?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load testimonials');
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
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function createItem(payload: TestimonialPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Testimonial>('/api/v1/admin/testimonials', {
                method: 'POST',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load(1);
        } finally {
            setIsSaving(false);
        }
    }

    async function updateItem(id: number, payload: TestimonialPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Testimonial>(`/api/v1/admin/testimonials/${id}`, {
                method: 'PUT',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Update failed');
            await load(currentPage);
        } finally {
            setIsSaving(false);
        }
    }

    const deleteItem = React.useCallback(
        async (item: Testimonial) => {
            if (!confirm(`Delete testimonial from "${item.customer_name}"?`)) return;
            setIsDeleting(true);
            try {
                const res = await apiFetch<unknown>(`/api/v1/admin/testimonials/${item.id}`, {
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
        },
        [currentPage, load],
    );

    const columns = useMemo<ColumnDef<Testimonial>[]>(
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
                id: 'customer_name',
                accessorKey: 'customer_name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Customer <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'rating',
                accessorKey: 'rating',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <Stars rating={row.original.rating} />,
            },
            {
                id: 'sort_order',
                accessorKey: 'sort_order',
                header: 'Order',
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
                    <div className="text-lg font-semibold">Testimonials</div>
                    <div className="text-sm text-muted-foreground">
                        Manage customer social proof for homepage and product pages.
                    </div>
                </div>
                <CreateDialog onCreate={createItem} />
            </div>

            <DataTable<Testimonial, unknown>
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
                emptyMessage="No testimonials found."
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

            <FullScreenLoader open={isSaving} text="Saving testimonial..." />
            <FullScreenLoader open={isDeleting} text="Deleting testimonial..." />
        </div>
    );
}

