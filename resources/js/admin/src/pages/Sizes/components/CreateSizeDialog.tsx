import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { SizePayload } from '../../../types/size';
import { SIZE_TYPES } from '../../../types/size';

export function CreateSizeDialog({
    onCreate,
}: {
    onCreate: (data: SizePayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState(SIZE_TYPES[0]);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({ name, type });
            setOpen(false);
            setName('');
            setType(SIZE_TYPES[0]);
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
            title="Create Size"
            trigger={<Button className="cursor-pointer">Create</Button>}
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="size-type">Category / Type</Label>
                    <select
                        id="size-type"
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
                    <Label htmlFor="size-name">
                        Size Name (e.g. 2.4, Size 14)
                    </Label>
                    <Input
                        id="size-name"
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
                    onCancel={() => setOpen(false)}
                    isSaving={saving}
                />
            </form>
        </CrudDialog>
    );
}
