import React from 'react';
import { Button } from '../../../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../../components/ui/dialog';
import type { ProductType } from '../../../types/productType';

export function ViewProductTypeDialog({
    productType,
    open,
    onOpenChange,
}: {
    productType: ProductType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!productType) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Product Type Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">ID</div>
                        <div className="col-span-2">{productType.id}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">Name</div>
                        <div className="col-span-2">{productType.name}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">Slug</div>
                        <div className="col-span-2">{productType.slug}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">Model Name</div>
                        <div className="col-span-2">{productType.model_name || '(none)'}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">Active</div>
                        <div className="col-span-2">
                            {productType.is_active ? 'Yes' : 'No'}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="font-medium text-muted-foreground">Created</div>
                        <div className="col-span-2">
                            {new Date(productType.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
