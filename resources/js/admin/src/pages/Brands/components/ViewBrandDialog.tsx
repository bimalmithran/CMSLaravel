import React from 'react';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Brand } from '../../../types/brand';

export function ViewBrandDialog({
    brand,
    open,
    onOpenChange,
}: {
    brand: Brand;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Brand">
            <div className="space-y-4">
                <div>
                    <strong>Logo:</strong>
                    {brand.logo ? (
                        <div className="mt-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded border bg-muted">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <span className="ml-2 text-muted-foreground">
                            (none)
                        </span>
                    )}
                </div>
                <div>
                    <strong>Name:</strong> {brand.name}
                </div>
                <div>
                    <strong>Slug:</strong> {brand.slug}
                </div>
                <div>
                    <strong>Active:</strong> {brand.is_active ? 'Yes' : 'No'}
                </div>
            </div>
            <DialogFooter
                onCancel={() => onOpenChange(false)}
                showSave={false}
                cancelText="Close"
            />
        </CrudDialog>
    );
}
