import React, { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type { Category } from '../../../types/category';

export function CreateCategoryDialog({
    onCreate,
    parents,
}: {
    parents: Category[];
    onCreate: (payload: {
        name: string;
        description?: string;
        parent_id?: number | null;
        order?: number;
        is_active?: boolean;
        image?: string;
    }) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState<number | ''>('');
    const [order, setOrder] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [image, setImage] = useState<string>('');

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                order,
                is_active: isActive,
                image: image || undefined,
            });
            setOpen(false);
            setName('');
            setDescription('');
            setParentId('');
            setOrder(0);
            setIsActive(true);
            setImage('');
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
            title="Create Category"
            trigger={<Button className="cursor-pointer">Create</Button>}
            size="lg"
        >
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
                    <Label htmlFor="cat-parent">Parent category</Label>
                    <select
                        id="cat-parent"
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
                        {parents.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="cat-order">Order</Label>
                        <Input
                            id="cat-order"
                            type="number"
                            value={String(order)}
                            onChange={(e) => setOrder(Number(e.target.value))}
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
                <div className="space-y-2">
                    <Label>Category Image</Label>
                    <MediaPicker value={image} onSelect={setImage} />
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
