import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type { Category } from '../../../types/category';

export function EditCategoryDialog({
    category,
    parents,
    open,
    onOpenChange,
    onUpdate,
}: {
    category: Category;
    parents: Category[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (
        id: number,
        data: {
            name: string;
            description?: string;
            parent_id?: number | null;
            order?: number;
            is_active?: boolean;
            image?: string | null;
        },
    ) => Promise<void>;
}) {
    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(category.description);
    const [parentId, setParentId] = useState<number | ''>(
        category.parent_id === null ? '' : category.parent_id,
    );
    const [order, setOrder] = useState<number>(category.order);
    const [isActive, setIsActive] = useState(category.is_active);
    const [image, setImage] = useState<string>(category.image || '');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(category.name);
        setDescription(category.description);
        setParentId(category.parent_id === null ? '' : category.parent_id);
        setOrder(category.order);
        setIsActive(category.is_active);
        setImage(category.image || '');
        setErr(null);
    }, [category]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(category.id, {
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                order,
                is_active: isActive,
                image: image || null,
            });
            onOpenChange(false);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Category"
            size='lg'
        >
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
                    <Label htmlFor="edit-desc">Description</Label>
                    <Input
                        id="edit-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-parent">Parent Category</Label>
                    <select
                        id="edit-parent"
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
                        <Label htmlFor="edit-order">Order</Label>
                        <Input
                            id="edit-order"
                            type="number"
                            value={String(order)}
                            onChange={(e) => setOrder(Number(e.target.value))}
                        />
                    </div>
                    <div className="mt-6 flex items-center">
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
                    onCancel={() => onOpenChange(false)}
                    isSaving={saving}
                />
            </form>
        </CrudDialog>
    );
}
