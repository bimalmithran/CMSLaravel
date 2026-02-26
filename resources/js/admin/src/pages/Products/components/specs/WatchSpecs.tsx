import React from 'react';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import type { SpecFormProps } from '../../../../types/product';

export function WatchSpecs({ specs, onChange }: SpecFormProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label>Movement</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={String(specs.movement_type || '')}
                    onChange={(e) => onChange('movement_type', e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Mechanical">Mechanical</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Case Size (mm)</Label>
                <Input
                    value={String(specs.case_size || '')}
                    onChange={(e) => onChange('case_size', e.target.value)}
                    placeholder="e.g. 40mm"
                />
            </div>
            <div className="space-y-2">
                <Label>Dial Color</Label>
                <Input
                    value={String(specs.dial_color || '')}
                    onChange={(e) => onChange('dial_color', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Strap Material</Label>
                <Input
                    value={String(specs.strap_material || '')}
                    onChange={(e) => onChange('strap_material', e.target.value)}
                />
            </div>
        </div>
    );
}
