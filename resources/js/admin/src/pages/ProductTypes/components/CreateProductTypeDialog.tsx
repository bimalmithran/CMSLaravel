import React, { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';

export function CreateProductTypeDialog({
    onCreate,
}: {
    onCreate: (payload: {
        name: string;
        model_name?: string;
        is_active?: boolean;
    }) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [modelName, setModelName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({
                name,
                model_name: modelName.trim() ? modelName : undefined,
                is_active: isActive,
            });
            setOpen(false);
            setName('');
            setModelName('');
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
            title="Create Product Type"
            trigger={<Button className="cursor-pointer">Create</Button>}
            size="md"
        >
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="pt-name">Name</Label>
                    <Input
                        id="pt-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pt-model">Model Name</Label>
                    <Input
                        id="pt-model"
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
                            id="pt-active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label
                            htmlFor="pt-active"
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
                    onCancel={() => setOpen(false)}
                    isSaving={saving}
                />
            </form>
        </CrudDialog>
    );
}
