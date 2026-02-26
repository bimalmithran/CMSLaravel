import React from 'react';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Size } from '../../../types/size';

export function ViewSizeDialog({
    size,
    open,
    onOpenChange,
}: {
    size: Size;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Size">
            <div className="space-y-4">
                <div>
                    <strong>Type:</strong>{' '}
                    <span className="capitalize">{size.type}</span>
                </div>
                <div>
                    <strong>Name:</strong> {size.name}
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
