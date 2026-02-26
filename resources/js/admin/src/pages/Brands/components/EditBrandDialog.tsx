import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type { Brand, BrandPayload } from '../../../types/brand';

export function EditBrandDialog({
    brand,
    open,
    onOpenChange,
    onUpdate,
}: {
    brand: Brand;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: BrandPayload) => Promise<void>;
}) {
    const [name, setName] = useState(brand.name);
    const [logo, setLogo] = useState(brand.logo || '');
    const [isActive, setIsActive] = useState(brand.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(brand.name);
        setLogo(brand.logo || '');
        setIsActive(brand.is_active);
        setErr(null);
    }, [brand]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(brand.id, {
                name,
                logo: logo || null,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Brand">
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
                    <Label>Brand Logo</Label>
                    <MediaPicker value={logo} onSelect={setLogo} />
                </div>
                <div className="mt-4 flex items-center">
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
