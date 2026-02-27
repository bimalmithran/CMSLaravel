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
import { HtmlContentPreview } from '../../components/HtmlContentPreview';
import { MediaPicker } from '../../components/MediaPicker';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { WysiwygHtmlEditor } from '../../components/WysiwygHtmlEditor';
import { apiFetch } from '../../lib/api';
import type {
    ContentBlock,
    ContentBlockPayload,
    ContentBlockType,
    PaginatedResponse,
} from '../../types/contentBlock';

const BLOCK_TYPES: ContentBlockType[] = ['text', 'html', 'image', 'json'];

function escapeHtml(input: string): string {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

type ContentBlockFormValues = {
    name: string;
    identifier: string;
    type: ContentBlockType;
    content: string;
    is_active: boolean;
};

function toFormValues(block?: ContentBlock): ContentBlockFormValues {
    return {
        name: block?.name ?? '',
        identifier: block?.identifier ?? '',
        type: block?.type ?? 'text',
        content: block?.content ?? '',
        is_active: block?.is_active ?? true,
    };
}

function toIdentifier(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s_]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_');
}

function ContentInputByType({
    type,
    content,
    onChange,
}: {
    type: ContentBlockType;
    content: string;
    onChange: (content: string) => void;
}) {
    if (type === 'image') {
        return <MediaPicker value={content} onSelect={onChange} />;
    }

    if (type === 'html') {
        return (
            <WysiwygHtmlEditor
                value={content}
                onChange={onChange}
                sourcePlaceholder="<section><h2>Why Choose Us</h2><p>...</p></section>"
                sourceRows={14}
                sourceHint="Stored as raw HTML for flexible storefront rendering."
            />
        );
    }

    if (type === 'json') {
        return (
            <div className="space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    rows={12}
                    className="font-mono text-xs"
                    placeholder='[{"title":"Free Shipping","icon":"truck"}]'
                />
                <p className="text-xs text-muted-foreground">
                    Enter valid JSON. It will be returned as parsed JSON in the public API.
                </p>
            </div>
        );
    }

    return (
        <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder="Enter plain text content..."
        />
    );
}

function ContentBlockForm({
    value,
    onChange,
}: {
    value: ContentBlockFormValues;
    onChange: (next: ContentBlockFormValues) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="block-name">Name</Label>
                    <Input
                        id="block-name"
                        value={value.name}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                name: e.target.value,
                                identifier: value.identifier
                                    ? value.identifier
                                    : toIdentifier(e.target.value),
                            })
                        }
                        placeholder="Footer Newsletter CTA"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="block-identifier">Identifier</Label>
                    <Input
                        id="block-identifier"
                        value={value.identifier}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                identifier: toIdentifier(e.target.value),
                            })
                        }
                        placeholder="footer_newsletter_cta"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="block-type">Type</Label>
                <Select
                    value={value.type}
                    onValueChange={(type) =>
                        onChange({
                            ...value,
                            type: type as ContentBlockType,
                            content: type !== value.type ? '' : value.content,
                        })
                    }
                >
                    <SelectTrigger id="block-type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BLOCK_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type.toUpperCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Content</Label>
                <ContentInputByType
                    type={value.type}
                    content={value.content}
                    onChange={(content) => onChange({ ...value, content })}
                />
            </div>

            <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                    id="block-active"
                    checked={value.is_active}
                    onCheckedChange={(checked) =>
                        onChange({ ...value, is_active: checked === true })
                    }
                />
                <Label htmlFor="block-active" className="cursor-pointer">
                    Active
                </Label>
            </div>
        </div>
    );
}

function CreateContentBlockDialog({
    onCreate,
}: {
    onCreate: (payload: ContentBlockPayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<ContentBlockFormValues>(toFormValues());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onCreate({
                name: form.name,
                identifier: form.identifier,
                type: form.type,
                content: form.content || null,
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
            title="Create Content Block"
            size="xl"
            trigger={
                <Button className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    New Block
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <ContentBlockForm value={form} onChange={setForm} />
                <DialogFooter onCancel={() => setOpen(false)} isSaving={saving} saveText="Create Block" />
            </form>
        </CrudDialog>
    );
}

function EditContentBlockDialog({
    block,
    open,
    onOpenChange,
    onUpdate,
}: {
    block: ContentBlock;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: ContentBlockPayload) => Promise<void>;
}) {
    const [form, setForm] = useState<ContentBlockFormValues>(toFormValues(block));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm(toFormValues(block));
        setError(null);
    }, [block]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onUpdate(block.id, {
                name: form.name,
                identifier: form.identifier,
                type: form.type,
                content: form.content || null,
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
            title="Edit Content Block"
            size="xl"
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </div>
                )}
                <ContentBlockForm value={form} onChange={setForm} />
                <DialogFooter onCancel={() => onOpenChange(false)} isSaving={saving} saveText="Save Changes" />
            </form>
        </CrudDialog>
    );
}

function ViewContentBlockDialog({
    block,
    open,
    onOpenChange,
}: {
    block: ContentBlock;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Content Block" size="lg">
            <div className="space-y-3 text-sm">
                <div>
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div>{block.name}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Identifier</div>
                    <div className="font-mono">{block.identifier}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div>{block.type}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div>{block.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Content</div>
                    {block.type === 'image' && block.content ? (
                        <div className="mt-1 h-40 w-full overflow-hidden rounded-md border bg-muted">
                            <img
                                src={block.content}
                                alt={block.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : block.type === 'json' ? (
                        <pre className="max-h-72 overflow-auto rounded-md border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                            {block.content || '(empty)'}
                        </pre>
                    ) : (
                        <HtmlContentPreview
                            html={
                                block.type === 'text'
                                    ? `<p>${escapeHtml(block.content || '')}</p>`
                                    : block.content || ''
                            }
                            className="max-h-72"
                        />
                    )}
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

export function ContentBlocksPage() {
    const [items, setItems] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [viewBlock, setViewBlock] = useState<ContentBlock | null>(null);
    const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);

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

                const res = await apiFetch<PaginatedResponse<ContentBlock>>(
                    '/api/v1/admin/content-blocks?' + params.toString()
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load content blocks');
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
        [search, sorting]
    );

    useEffect(() => {
        void load();
    }, [load]);

    async function createBlock(payload: ContentBlockPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<ContentBlock>('/api/v1/admin/content-blocks', {
                method: 'POST',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Create failed');
            await load(1);
        } finally {
            setIsSaving(false);
        }
    }

    async function updateBlock(id: number, payload: ContentBlockPayload) {
        setIsSaving(true);
        try {
            const res = await apiFetch<ContentBlock>(`/api/v1/admin/content-blocks/${id}`, {
                method: 'PUT',
                json: payload,
            });
            if (!res.success) throw new Error(res.message || 'Update failed');
            await load(currentPage);
        } finally {
            setIsSaving(false);
        }
    }

    const deleteBlock = React.useCallback(
        async (item: ContentBlock) => {
            if (!confirm(`Delete content block "${item.name}"?`)) return;

            setIsDeleting(true);
            try {
                const res = await apiFetch<unknown>(`/api/v1/admin/content-blocks/${item.id}`, {
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
        [currentPage, load]
    );

    const columns = useMemo<ColumnDef<ContentBlock>[]>(
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
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'identifier',
                accessorKey: 'identifier',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 cursor-pointer"
                    >
                        Identifier <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-xs">{row.original.identifier}</span>
                ),
            },
            {
                id: 'type',
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }) => row.original.type.toUpperCase(),
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
                                        onClick={() => setViewBlock(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditBlock(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => void deleteBlock(item)}
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
        [deleteBlock]
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Content Blocks</div>
                    <div className="text-sm text-muted-foreground">
                        Manage reusable text, HTML, image, and JSON snippets for the storefront.
                    </div>
                </div>
                <CreateContentBlockDialog onCreate={createBlock} />
            </div>

            <DataTable<ContentBlock, unknown>
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
                emptyMessage="No content blocks found."
                error={error}
                title="List"
            />

            {viewBlock && (
                <ViewContentBlockDialog
                    block={viewBlock}
                    open={!!viewBlock}
                    onOpenChange={(open) => !open && setViewBlock(null)}
                />
            )}

            {editBlock && (
                <EditContentBlockDialog
                    block={editBlock}
                    open={!!editBlock}
                    onOpenChange={(open) => !open && setEditBlock(null)}
                    onUpdate={updateBlock}
                />
            )}

            <FullScreenLoader open={isSaving} text="Saving content block..." />
            <FullScreenLoader open={isDeleting} text="Deleting content block..." />
        </div>
    );
}
