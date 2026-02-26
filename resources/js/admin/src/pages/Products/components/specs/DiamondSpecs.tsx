import React from 'react';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import type { SpecFormProps } from '../../../../types/product';

export function DiamondSpecs({ specs, onChange }: SpecFormProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Diamond Clarity</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={String(specs.diamond_clarity || '')} onChange={(e) => onChange('diamond_clarity', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="FL">FL (Flawless)</option>
                    <option value="IF">IF (Internally Flawless)</option>
                    <option value="VVS1">VVS1</option>
                    <option value="VVS2">VVS2</option>
                    <option value="VS1">VS1</option>
                    <option value="VS2">VS2</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Diamond Color</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={String(specs.diamond_color || '')} onChange={(e) => onChange('diamond_color', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="D">D (Colorless)</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G (Near Colorless)</option>
                    <option value="H">H</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Diamond Cut</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={String(specs.diamond_cut || '')} onChange={(e) => onChange('diamond_cut', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Diamond Setting</Label>
                <Input value={String(specs.diamond_setting || '')} onChange={(e) => onChange('diamond_setting', e.target.value)} placeholder="e.g. Prong, Pave" />
            </div>
            <div className="space-y-2">
                <Label>Stone Count</Label>
                <Input type="number" value={Number(specs.diamond_count || 0)} onChange={(e) => onChange('diamond_count', Number(e.target.value))} />
            </div>
        </div>
    );
}