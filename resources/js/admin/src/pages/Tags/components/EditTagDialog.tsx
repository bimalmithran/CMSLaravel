import React, { useEffect, useState } from 'react';

import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Tag, TagPayload } from '../../../types/tag';

export function EditTagDialog({
    tag,
    open,
    onOpenChange,
    onUpdate,
}: {
    tag: Tag;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: TagPayload) => Promise<void>;
}) {
    const [name, setName] = useState(tag.name);
    const [isActive, setIsActive] = useState(tag.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(tag.name);
        setIsActive(tag.is_active);
        setErr(null);
    }, [tag]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(tag.id, {
                name,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Tag">
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="edit-tag-name">Name</Label>
                    <Input
                        id="edit-tag-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-4 flex items-center">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="edit-tag-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label
                            htmlFor="edit-tag-active"
                            className="m-0 cursor-pointer font-normal"
                        >
                            Active
                        </Label>
                    </div>
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
