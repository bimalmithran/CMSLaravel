import React, { useEffect, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { ProductType } from '../../../types/productType';

export function EditProductTypeDialog({
    productType,
    open,
    onOpenChange,
    onUpdate,
}: {
    productType: ProductType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, payload: Record<string, unknown>) => Promise<void>;
}) {
    const [name, setName] = useState('');
    const [modelName, setModelName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName(productType.name || '');
            setModelName(productType.model_name || '');
            setIsActive(productType.is_active ?? true);
            setErr(null);
        }
    }, [open, productType]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(productType.id, {
                name,
                model_name: modelName.trim() ? modelName : undefined,
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
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Product Type"
            size="md"
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="pt-edit-name">Name</Label>
                    <Input
                        id="pt-edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pt-edit-model">Model Name</Label>
                    <Input
                        id="pt-edit-model"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="App\Models\..."
                    />
                    <div className="text-sm text-muted-foreground">Optional. A specific Eloquent model class backing this product specification.</div>
                </div>
                <div className="mt-6 flex items-center">
                    <Field
                        orientation="horizontal"
                        className="flex items-center gap-2"
                    >
                        <Checkbox
                            id="pt-edit-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label
                            htmlFor="pt-edit-active"
                            className="m-0 cursor-pointer font-normal"
                        >
                            Active
                        </Label>
                    </Field>
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
