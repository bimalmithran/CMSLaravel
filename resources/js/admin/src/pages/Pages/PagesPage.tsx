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
import { Textarea } from '../../../../components/ui/textarea';
import { CrudDialog, DialogFooter } from '../../components/CrudDialog';
import { DataTable } from '../../components/DataTable';
import { HtmlContentPreview } from '../../components/HtmlContentPreview';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { WysiwygHtmlEditor } from '../../components/WysiwygHtmlEditor';
import { apiFetch } from '../../lib/api';
import type { Page, PagePayload, PaginatedResponse } from '../../types/page';

type PageFormValues = {
    title: string;
    slug: string;
    content: string;
    meta_title: string;
    meta_description: string;
    is_active: boolean;
};

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function toFormValues(page?: Page): PageFormValues {
    return {
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        content: page?.content ?? '',
        meta_title: page?.meta_title ?? '',
        meta_description: page?.meta_description ?? '',
        is_active: page?.is_active ?? false,
    };
}

function PageForm({
    value,
    onChange,
}: {
    value: PageFormValues;
    onChange: (next: PageFormValues) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="page-title">Title</Label>
                    <Input
                        id="page-title"
                        value={value.title}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                title: e.target.value,
                                slug: value.slug ? value.slug : slugify(e.target.value),
                            })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="page-slug">Slug</Label>
                    <Input
                        id="page-slug"
                        value={value.slug}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                slug: slugify(e.target.value),
                            })
                        }
                        placeholder="terms-and-conditions"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Page Content</Label>
                <WysiwygHtmlEditor
                    value={value.content}
                    onChange={(content) => onChange({ ...value, content })}
                    visualPlaceholder="Write your page content here..."
                    sourcePlaceholder="<section><h1>About Us</h1><p>...</p></section>"
                    sourceRows={16}
                    sourceHint="Paste full HTML here for complex layouts. This content is stored as-is."
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="page-meta-title">Meta Title</Label>
                    <Input
                        id="page-meta-title"
                        value={value.meta_title}
                        onChange={(e) => onChange({ ...value, meta_title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="page-meta-description">Meta Description</Label>
                    <Textarea
                        id="page-meta-description"
                        rows={3}
                        value={value.meta_description}
                        onChange={(e) =>
                            onChange({ ...value, meta_description: e.target.value })
                        }
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                    id="page-is-active"
                    checked={value.is_active}
                    onCheckedChange={(checked) =>
                        onChange({ ...value, is_active: checked === true })
                    }
                />
                <Label htmlFor="page-is-active" className="cursor-pointer">
                    Published (active)
                </Label>
            </div>
        </div>
    );
}

function CreatePageDialog({
    onCreate,
}: {
    onCreate: (payload: PagePayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<PageFormValues>(toFormValues());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onCreate({
                title: form.title,
                slug: form.slug,
                content: form.content,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                is_active: form.is_active,
            });
            setOpen(false);
            setForm(toFormValues());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create page');
        } finally {
            setSaving(false);
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
            title="Create Page"
            size="xl"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Page
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <PageForm value={form} onChange={setForm} />
                <DialogFooter onCancel={() => setOpen(false)} isSaving={saving} saveText="Create Page" />
            </form>
        </CrudDialog>
    );
}

function EditPageDialog({
    page,
    open,
    onOpenChange,
    onUpdate,
}: {
    page: Page;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: PagePayload) => Promise<void>;
}) {
    const [form, setForm] = useState<PageFormValues>(toFormValues(page));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm(toFormValues(page));
        setError(null);
    }, [page]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onUpdate(page.id, {
                title: form.title,
                slug: form.slug,
                content: form.content,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                is_active: form.is_active,
            });
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update page');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Page" size="xl">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <PageForm value={form} onChange={setForm} />
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    isSaving={saving}
                    saveText="Save Changes"
                />
            </form>
        </CrudDialog>
    );
}

function ViewPageDialog({
    page,
    open,
    onOpenChange,
}: {
    page: Page;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Page" size="lg">
            <div className="space-y-4 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Title</div>
                    <div>{page.title}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Slug</div>
                    <div className="font-mono">{page.slug}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div>{page.is_active ? 'Published' : 'Draft'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Meta Title</div>
                    <div>{page.meta_title || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Meta Description</div>
                    <div>{page.meta_description || '(none)'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Content Preview</div>
                    <HtmlContentPreview html={page.content} />
                </div>
            </div>
            <DialogFooter onCancel={() => onOpenChange(false)} showSave={false} cancelText="Close" />
        </CrudDialog>
    );
}

export function PagesPage() {
    const [items, setItems] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewPage, setViewPage] = useState<Page | null>(null);
    const [editPage, setEditPage] = useState<Page | null>(null);

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

                const res = await apiFetch<PaginatedResponse<Page>>(
                    '/api/v1/admin/pages?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load pages');
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

    async function createPage(payload: PagePayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Page>('/api/v1/admin/pages', {
                method: 'POST',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load();
        } finally {
            setIsSaving(false);
        }
    }

    async function updatePage(id: number, payload: PagePayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<Page>(`/api/v1/admin/pages/${id}`, {
                method: 'PUT',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Update failed');
            await load(currentPage);
        } finally {
            setIsSaving(false);
        }
    }

    const deletePage = React.useCallback(
        async (item: Page) => {
            if (!confirm(`Delete page "${item.title}"?`)) return;
            setIsDeleting(true);
            try {
                const res = await apiFetch<unknown>(`/api/v1/admin/pages/${item.id}`, {
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

    const columns = useMemo<ColumnDef<Page>[]>(
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
            },
            {
                id: 'slug',
                accessorKey: 'slug',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Slug <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <span className="font-mono text-xs">{row.original.slug}</span>,
            },
            {
                id: 'active',
                accessorKey: 'is_active',
                header: 'Published',
                cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
            },
            {
                id: 'updated_at',
                accessorKey: 'updated_at',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Updated <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => new Date(row.original.updated_at).toLocaleString(),
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
                                        onClick={() => setViewPage(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditPage(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => void deletePage(item)}
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
        [deletePage],
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Dynamic Pages</div>
                    <div className="text-sm text-muted-foreground">
                        Manage About Us, Terms & Conditions, Privacy Policy, and other custom pages.
                    </div>
                </div>
                <CreatePageDialog onCreate={createPage} />
            </div>

            <DataTable<Page, unknown>
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
                emptyMessage="No pages found."
                error={error}
                title="List"
            />

            {viewPage && (
                <ViewPageDialog
                    page={viewPage}
                    open={!!viewPage}
                    onOpenChange={(open) => !open && setViewPage(null)}
                />
            )}
            {editPage && (
                <EditPageDialog
                    page={editPage}
                    open={!!editPage}
                    onOpenChange={(open) => !open && setEditPage(null)}
                    onUpdate={updatePage}
                />
            )}

            <FullScreenLoader open={isSaving} text="Saving page..." />
            <FullScreenLoader open={isDeleting} text="Deleting page..." />
        </div>
    );
}
