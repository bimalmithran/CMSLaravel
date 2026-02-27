import React from 'react';

import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';

interface CrudDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    trigger?: React.ReactNode;
    children: React.ReactNode;
    size?: 'default' | 'lg' | 'xl';
}

export function CrudDialog({
    open,
    onOpenChange,
    title,
    trigger,
    children,
    size = 'default',
}: CrudDialogProps) {
    const maxWidthClass = {
        default: 'sm:max-w-lg', // Standard (<= 4 fields)
        lg: 'sm:max-w-2xl', // Large (> 4 fields)
        xl: 'sm:max-w-4xl', // Extra Large (> 10 fields or complex Steppers)
    }[size];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={`${maxWidthClass} max-h-[90vh] overflow-y-auto`}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}

interface DialogFooterProps {
    onCancel: () => void;
    isSaving?: boolean;
    showSave?: boolean;
    cancelText?: string;
    saveText?: string;
}

export function DialogFooter({
    onCancel,
    isSaving = false,
    showSave = true,
    cancelText = 'Cancel',
    saveText = 'Save',
}: DialogFooterProps) {
    return (
        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
            >
                {cancelText}
            </Button>
            {showSave && (
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : saveText}
                </Button>
            )}
        </div>
    );
}
