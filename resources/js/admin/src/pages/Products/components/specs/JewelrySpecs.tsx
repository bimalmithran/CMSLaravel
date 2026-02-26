import React from 'react';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import type { SpecFormProps } from '../../../../types/product';

export function JewelrySpecs({ specs, onChange }: SpecFormProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
                <Label>HUID (6 Digit)</Label>
                <Input
                    value={String(specs.huid || '')}
                    onChange={(e) => onChange('huid', e.target.value)}
                    maxLength={6}
                />
            </div>
            <div className="space-y-2">
                <Label>Metal Type</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={String(specs.metal_type || '')}
                    onChange={(e) => onChange('metal_type', e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Purity</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={String(specs.purity || '')}
                    onChange={(e) => onChange('purity', e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="22k">22k (916)</option>
                    <option value="18k">18k</option>
                    <option value="24k">24k</option>
                    <option value="925">925 Sterling</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label>Net Weight (g)</Label>
                <Input
                    type="number"
                    step="0.001"
                    value={Number(specs.net_weight || 0)}
                    onChange={(e) =>
                        onChange('net_weight', Number(e.target.value))
                    }
                />
            </div>
            <div className="space-y-2">
                <Label>Making Charge</Label>
                <Input
                    type="number"
                    value={Number(specs.making_charge || 0)}
                    onChange={(e) =>
                        onChange('making_charge', Number(e.target.value))
                    }
                />
            </div>
            <div className="space-y-2">
                <Label>Charge Type</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={String(specs.making_charge_type || 'percent')}
                    onChange={(e) =>
                        onChange('making_charge_type', e.target.value)
                    }
                >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                </select>
            </div>
        </div>
    );
}
