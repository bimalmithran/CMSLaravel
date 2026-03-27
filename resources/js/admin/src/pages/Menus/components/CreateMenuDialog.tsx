import React, { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { MenuItem, PageListItem } from '../../../types/menu';

export function CreateMenuDialog({
    onCreate,
    parents,
    pages,
}: {
    onCreate: (data: {
        name: string;
        description?: string;
        menu_type: 'link' | 'dropdown' | 'product_listing';
        page_id: number | null;
        is_active: boolean;
        position: number;
        parent_id: number | null;
        placement: 'header' | 'footer';
    }) => Promise<void>;
    parents: MenuItem[];
    pages: PageListItem[];
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [menuType, setMenuType] = useState<
        'link' | 'dropdown' | 'product_listing'
    >('link');
    const [pageId, setPageId] = useState<number | ''>('');
    const [parentId, setParentId] = useState<number | ''>('');
    const [position, setPosition] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [placement, setPlacement] = useState<'header' | 'footer'>('header');
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
                menu_type: menuType,
                page_id: menuType === 'link' ? (pageId === '' ? null : pageId) : null,
                parent_id: parentId === '' ? null : parentId,
                position,
                is_active: isActive,
                placement,
            });
            setOpen(false);
            setName('');
            setDescription('');
            setMenuType('link');
            setPageId('');
            setParentId('');
            setPosition(0);
            setIsActive(true);
            setPlacement('header');
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
            title="Create Menu"
            trigger={<Button className="cursor-pointer">Create</Button>}
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="menu-name">Name</Label>
                    <Input
                        id="menu-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="menu-desc">Description</Label>
                    <Input
                        id="menu-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="menu-type">Menu Type</Label>
                    <select
                        id="menu-type"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={menuType}
                        onChange={(e) => {
                            const next = e.target.value as
                                | 'link'
                                | 'dropdown'
                                | 'product_listing';
                            setMenuType(next);
                            if (next !== 'link') setPageId('');
                        }}
                    >
                        <option value="link">Link</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="product_listing">Product Listing</option>
                    </select>
                </div>
                {menuType === 'link' && (
                    <div className="space-y-2">
                        <Label htmlFor="menu-page">Page</Label>
                        <select
                            id="menu-page"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={pageId}
                            onChange={(e) =>
                                setPageId(
                                    e.target.value === ''
                                        ? ''
                                        : Number(e.target.value),
                                )
                            }
                            required
                        >
                            <option value="">Select a page</option>
                            {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.title} ({page.slug})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="menu-parent">Parent Menu</Label>
                    <select
                        id="menu-parent"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={parentId}
                        onChange={(e) =>
                            setParentId(
                                e.target.value === ''
                                    ? ''
                                    : Number(e.target.value),
                            )
                        }
                    >
                        <option value="">(none)</option>
                        {parents
                            .filter((p) => p.menu_type === 'dropdown')
                            .map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                            ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="menu-placement">Placement</Label>
                    <select
                        id="menu-placement"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={placement}
                        onChange={(e) => setPlacement(e.target.value as 'header' | 'footer')}
                    >
                        <option value="header">Header</option>
                        <option value="footer">Footer</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="menu-position">Position</Label>
                        <Input
                            id="menu-position"
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
                                id="menu-active"
                                checked={isActive}
                                onCheckedChange={(v) => setIsActive(!!v)}
                            />
                            <Label
                                htmlFor="menu-active"
                                className="m-0 cursor-pointer font-normal"
                            >
                                Active
                            </Label>
                        </Field>
                    </div>
                </div>

                {err && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
