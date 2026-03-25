import React from 'react';

import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Tag } from '../../../types/tag';

export function ViewTagDialog({
    tag,
    open,
    onOpenChange,
}: {
    tag: Tag;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Tag">
            <div className="space-y-4">
                <div>
                    <strong>Name:</strong> {tag.name}
                </div>
                <div>
                    <strong>Slug:</strong> {tag.slug}
                </div>
                <div>
                    <strong>Active:</strong> {tag.is_active ? 'Yes' : 'No'}
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
