import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import type { MenuItem } from '../../../types/menu';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';

export function EditMenuDialog({
    menu,
    parents,
    open,
    onOpenChange,
    onUpdate,
}: {
    menu: MenuItem;
    parents: MenuItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (
        id: number,
        data: {
            name: string;
            description?: string;
            parent_id?: number | null;
            position?: number;
            is_active?: boolean;
        },
    ) => Promise<void>;
}) {
    const [name, setName] = useState(menu.name);
    const [description, setDescription] = useState(menu.description);
    const [parentId, setParentId] = useState<number | ''>(
        menu.parent_id === null ? '' : menu.parent_id,
    );
    const [position, setPosition] = useState<number>(menu.position);
    const [isActive, setIsActive] = useState(menu.is_active);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        setName(menu.name);
        setDescription(menu.description);
        setParentId(menu.parent_id === null ? '' : menu.parent_id);
        setPosition(menu.position);
        setIsActive(menu.is_active);
        setErr(null);
    }, [menu]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(menu.id, {
                name,
                description: description.trim() ? description : undefined,
                parent_id: parentId === '' ? null : parentId,
                position,
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
        <CrudDialog open={open} onOpenChange={onOpenChange} title="Edit Menu">
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
                    <Label htmlFor="edit-parent">Parent Menu</Label>
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
                        <Label htmlFor="edit-position">Position</Label>
                        <Input
                            id="edit-position"
                            type="number"
                            value={String(position)}
                            onChange={(e) =>
                                setPosition(Number(e.target.value))
                            }
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
