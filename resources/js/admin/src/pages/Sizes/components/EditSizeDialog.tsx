import React, { useState, useEffect } from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Size, SizePayload } from '../../../types/size';
import { SIZE_TYPES } from '../../../types/size';

export function EditSizeDialog({
    size,
    open,
    onOpenChange,
    onUpdate,
}: {
    size: Size;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: SizePayload) => Promise<void>;
}) {
    const [name, setName] = useState(size.name);
    const [type, setType] = useState(size.type);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(size.name);
        setType(size.type);
        setErr(null);
    }, [size]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(size.id, { name, type });
            onOpenChange(false);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Size">
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="edit-type">Category / Type</Label>
                    <select
                        id="edit-type"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm capitalize"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {SIZE_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Size Name</Label>
                    <Input
                        id="edit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                {err && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
