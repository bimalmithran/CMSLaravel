import React, { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type { BrandPayload } from '../../../types/brand';

export function CreateBrandDialog({
    onCreate,
}: {
    onCreate: (data: BrandPayload) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({ name, logo: logo || null, is_active: isActive });
            setOpen(false);
            setName('');
            setLogo('');
            setIsActive(true);
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
            title="Create Brand"
            trigger={<Button className="cursor-pointer">Create</Button>}
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="brand-name">Name</Label>
                    <Input
                        id="brand-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Brand Logo</Label>
                    <MediaPicker value={logo} onSelect={setLogo} />
                </div>
                <div className="mt-4 flex items-center">
                    <Field orientation="horizontal" className="flex items-center gap-2">
                        <Checkbox
                            id="brand-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label htmlFor="brand-active" className="m-0 cursor-pointer font-normal">
                            Active
                        </Label>
                    </Field>
                </div>
                {err && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {err}
                    </div>
                )}
                <DialogFooter onCancel={() => setOpen(false)} isSaving={saving} />
            </form>
        </CrudDialog>
    );
}
