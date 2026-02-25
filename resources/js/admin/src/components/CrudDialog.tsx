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
}

// 1. The main wrapper for the popup
export function CrudDialog({
    open,
    onOpenChange,
    title,
    trigger,
    children,
}: CrudDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* If a trigger button is passed (like "Create"), render it here */}
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {/* The form or view content gets injected here */}
                {children}
            </DialogContent>
        </Dialog>
    );
}

// 2. A reusable footer for standardizing Cancel/Save buttons
interface DialogFooterProps {
    onCancel: () => void;
    isSaving?: boolean;
    saveText?: string;
    cancelText?: string;
    showSave?: boolean;
}

export function DialogFooter({
    onCancel,
    isSaving = false,
    saveText = 'Save',
    cancelText = 'Cancel',
    showSave = true,
}: DialogFooterProps) {
    return (
        <div className="mt-6 flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="cursor-pointer"
            >
                {cancelText}
            </Button>

            {showSave && (
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer"
                >
                    {isSaving ? 'Saving…' : saveText}
                </Button>
            )}
        </div>
    );
}
