import React from 'react';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import type { Category } from '../../../types/category';

export function ViewCategoryDialog({
    category,
    open,
    onOpenChange,
}: {
    category: Category;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="View Category"
        >
            <div className="space-y-4">
                <div>
                    <strong>Image:</strong>
                    {category.image ? (
                        <div className="mt-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
                            <img
                                src={category.image}
                                alt={category.name}
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
                    <strong>Name:</strong> {category.name}
                </div>
                <div>
                    <strong>Slug:</strong> {category.slug}
                </div>
                <div>
                    <strong>Description:</strong> {category.description || '—'}
                </div>
                <div>
                    <strong>Parent:</strong> {category.parent?.name ?? '(none)'}
                </div>
                <div>
                    <strong>Order:</strong> {category.order}
                </div>
                <div>
                    <strong>Active:</strong> {category.is_active ? 'Yes' : 'No'}
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
