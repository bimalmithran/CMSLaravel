import React from 'react';
import type { MenuItem } from '../../../types/menu';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';

export function ViewMenuDialog({
    menu,
    open,
    onOpenChange,
}: {
    menu: MenuItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Menu">
            <div className="space-y-4">
                <div>
                    <strong>Name:</strong> {menu.name}
                </div>
                <div>
                    <strong>Slug:</strong> {menu.slug}
                </div>
                <div>
                    <strong>Description:</strong> {menu.description || '—'}
                </div>
                <div>
                    <strong>Parent:</strong> {menu.parent?.name ?? '(none)'}
                </div>
                <div>
                    <strong>Position:</strong> {menu.position}
                </div>
                <div>
                    <strong>Active:</strong> {menu.is_active ? 'Yes' : 'No'}
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
