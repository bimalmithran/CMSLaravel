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
import { CrudDialog, DialogFooter } from '../../components/CrudDialog';
import { DataTable } from '../../components/DataTable';
import { HtmlContentPreview } from '../../components/HtmlContentPreview';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { WysiwygHtmlEditor } from '../../components/WysiwygHtmlEditor';
import { apiFetch } from '../../lib/api';
import type { Faq, FaqPayload, PaginatedResponse } from '../../types/faq';

type FormValues = {
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    is_active: boolean;
};

function toFormValues(item?: Faq): FormValues {
    return {
        question: item?.question ?? '',
        answer: item?.answer ?? '',
        category: item?.category ?? '',
        sort_order: item?.sort_order ?? 0,
        is_active: item?.is_active ?? true,
    };
}

function FormBody({ value, onChange }: { value: FormValues; onChange: (next: FormValues) => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="faq-question">Question</Label>
                <Input
                    id="faq-question"
                    value={value.question}
                    onChange={(e) => onChange({ ...value, question: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Answer</Label>
                <WysiwygHtmlEditor
                    value={value.answer}
                    onChange={(answer) => onChange({ ...value, answer })}
                    visualPlaceholder="Write FAQ answer..."
                    sourcePlaceholder="<p>You can return products within 7 days...</p>"
                    sourceRows={12}
                    sourceHint="Add links and formatted text for support content."
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="faq-category">Category</Label>
                    <Input
                        id="faq-category"
                        value={value.category}
                        onChange={(e) => onChange({ ...value, category: e.target.value })}
                        placeholder="Shipping / Returns / Care"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="faq-sort">Sort Order</Label>
                    <Input
                        id="faq-sort"
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

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                    id="faq-active"
                    checked={value.is_active}
                    onCheckedChange={(checked) => onChange({ ...value, is_active: checked === true })}
                />
                <Label htmlFor="faq-active" className="cursor-pointer">
                    Active
                </Label>
            </div>
        </div>
    );
}

function CreateDialog({ onCreate }: { onCreate: (payload: FaqPayload) => Promise<void> }) {
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
                question: form.question,
                answer: form.answer,
                category: form.category || null,
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
            title="Create FAQ"
            size="xl"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New FAQ
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
    item: Faq;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: FaqPayload) => Promise<void>;
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
                question: form.question,
                answer: form.answer,
                category: form.category || null,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit FAQ" size="xl">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <FormBody value={form} onChange={setForm} />
                <DialogFooter onCancel={() => onOpenChange(false)} isSaving={saving} saveText="Save Changes" />
            </form>
        </CrudDialog>
    );
}

function ViewDialog({ item, open, onOpenChange }: { item: Faq; open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View FAQ">
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Question</div>
                    <div>{item.question}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Category</div>
                    <div>{item.category || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div>{item.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Answer</div>
                    <HtmlContentPreview html={item.answer} className="max-h-72" />
                </div>
            </div>
            <DialogFooter onCancel={() => onOpenChange(false)} showSave={false} cancelText="Close" />
        </CrudDialog>
    );
}

export function FaqsPage() {
    const [items, setItems] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewItem, setViewItem] = useState<Faq | null>(null);
    const [editItem, setEditItem] = useState<Faq | null>(null);

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

                const res = await apiFetch<PaginatedResponse<Faq>>('/api/v1/admin/faqs?' + params.toString());
                if (!res.success) {
                    setError(res.message || 'Failed to load FAQs');
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

    async function createItem(payload: FaqPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Faq>('/api/v1/admin/faqs', {
                method: 'POST',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load(1);
        } finally {
            setIsSaving(false);
        }
    }

    async function updateItem(id: number, payload: FaqPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Faq>(`/api/v1/admin/faqs/${id}`, {
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
        async (item: Faq) => {
            if (!confirm('Delete this FAQ?')) return;
            setIsDeleting(true);
            try {
                const res = await apiFetch<unknown>(`/api/v1/admin/faqs/${item.id}`, {
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

    const columns = useMemo<ColumnDef<Faq>[]>(
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
                id: 'question',
                accessorKey: 'question',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Question <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'category',
                accessorKey: 'category',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Category <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => row.original.category || '(none)',
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
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setViewItem(item)}>
                                        <ViewIcon className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setEditItem(item)}>
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
                    <div className="text-lg font-semibold">FAQs</div>
                    <div className="text-sm text-muted-foreground">
                        Manage support FAQs and grouped knowledge sections.
                    </div>
                </div>
                <CreateDialog onCreate={createItem} />
            </div>

            <DataTable<Faq, unknown>
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
                emptyMessage="No FAQs found."
                error={error}
                title="List"
            />

            {viewItem && (
                <ViewDialog item={viewItem} open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)} />
            )}
            {editItem && (
                <EditDialog
                    item={editItem}
                    open={!!editItem}
                    onOpenChange={(open) => !open && setEditItem(null)}
                    onUpdate={updateItem}
                />
            )}

            <FullScreenLoader open={isSaving} text="Saving FAQ..." />
            <FullScreenLoader open={isDeleting} text="Deleting FAQ..." />
        </div>
    );
}

