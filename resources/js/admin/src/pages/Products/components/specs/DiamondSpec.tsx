import React from 'react';

import { Checkbox } from '../../../../../../components/ui/checkbox';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import type { SpecFormProps } from '../../../../types/product';

export function DiamondSpec({ specs, onChange }: SpecFormProps) {
    // Helper functions to safely extract typed values from the generic specs dictionary
    const getString = (key: string) => (specs[key] as string) || '';
    const getNumber = (key: string) => (specs[key] as number) || '';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Count Input Example */}
                <div className="space-y-2">
                    <Label>Diamond Count</Label>
                    <Input
                        type="number"
                        step="1"
                        placeholder="e.g., 1"
                        value={getNumber('diamond_count')}
                        onChange={(e) =>
                            onChange(
                                'diamond_count',
                                e.target.value === ''
                                    ? ''
                                    : Number(e.target.value),
                            )
                        }
                    />
                </div>

                {/* Dropdown/Select Example */}
                <div className="space-y-2">
                    <Label>Diamond Shape / Setting</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                        value={getString('diamond_setting')}
                        onChange={(e) => onChange('diamond_setting', e.target.value)}
                    >
                        <option value="">Select...</option>
                        <option value="Round">Round</option>
                        <option value="Princess">Princess</option>
                        <option value="Cushion">Cushion</option>
                        <option value="Emerald">Emerald</option>
                        <option value="Oval">Oval</option>
                        <option value="Pear">Pear</option>
                        <option value="Marquise">Marquise</option>
                        <option value="Prong">Prong</option>
                        <option value="Bezel">Bezel</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Cut Grade</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                        value={getString('diamond_cut')}
                        onChange={(e) => onChange('diamond_cut', e.target.value)}
                    >
                        <option value="">Select Cut...</option>
                        <option value="Ideal">Ideal</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Very Good">Very Good</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Color Grade</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                        value={getString('diamond_color')}
                        onChange={(e) => onChange('diamond_color', e.target.value)}
                    >
                        <option value="">Select Color...</option>
                        <option value="D">D (Colorless)</option>
                        <option value="E">E (Colorless)</option>
                        <option value="F">F (Colorless)</option>
                        <option value="G">G (Near Colorless)</option>
                        <option value="H">H (Near Colorless)</option>
                        <option value="I">I (Near Colorless)</option>
                        <option value="J">J (Near Colorless)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Clarity Grade</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                        value={getString('diamond_clarity')}
                        onChange={(e) => onChange('diamond_clarity', e.target.value)}
                    >
                        <option value="">Select Clarity...</option>
                        <option value="FL">FL (Flawless)</option>
                        <option value="IF">IF (Internally Flawless)</option>
                        <option value="VVS1">VVS1</option>
                        <option value="VVS2">VVS2</option>
                        <option value="VS1">VS1</option>
                        <option value="VS2">VS2</option>
                        <option value="SI1">SI1</option>
                        <option value="SI2">SI2</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
