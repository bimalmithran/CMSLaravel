import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { CrudDialog } from '../../../components/CrudDialog';
import type { Product } from '../../../types/product';

export function ViewProductDialog({ 
    product, open, onOpenChange 
}: { 
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    // Helper to format keys like "metal_type" into "Metal Type"
    const formatLabel = (key: string) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Grab whichever spec object is populated
    const activeSpecs = product.jewelry_spec || product.watch_spec || product.diamond_spec || {};

    return (
        <CrudDialog open={open} onOpenChange={onOpenChange} title="View Product Details">
            <div className="space-y-6">
                
                {/* 1. Header & Image */}
                <div className="flex gap-4">
                    <div className="h-24 w-24 rounded border bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs text-muted-foreground">No Image</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{product.name}</h2>
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div><strong>SKU:</strong> {product.sku}</div>
                            <div><strong>Type:</strong> <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{product.productType?.name}</span></div>
                            <div>
                                <strong>Status:</strong> 
                                <span className={product.is_active ? "text-green-600 ml-1" : "text-destructive ml-1"}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Base Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-muted/30 border rounded-md">
                    <div><strong>Category:</strong> {product.category?.name || '—'}</div>
                    <div><strong>Brand:</strong> {product.brand?.name || '—'}</div>
                    <div><strong>Base Price:</strong> ₹{Number(product.price).toLocaleString('en-IN')}</div>
                    <div><strong>Base Stock:</strong> {product.stock} units</div>
                </div>

                {/* 3. Dynamic Specs Display */}
                {Object.keys(activeSpecs).length > 0 && (
                    <div className="space-y-2 p-4 border rounded-md border-primary/20">
                        <h3 className="font-semibold text-sm text-primary mb-3">Specifications</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            {Object.entries(activeSpecs).map(([key, value]) => {
                                // Skip internal ID and timestamps
                                if (['id', 'product_id', 'created_at', 'updated_at'].includes(key)) return null;
                                if (value === null || value === '') return null;
                                
                                return (
                                    <div key={key}>
                                        <strong className="text-muted-foreground">{formatLabel(key)}:</strong> {String(value)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 4. Gallery Display */}
                {product.gallery && product.gallery.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Gallery</h3>
                        <div className="flex gap-2 flex-wrap">
                            {product.gallery.map((img, idx) => (
                                <img key={idx} src={img} alt={`Gallery ${idx}`} className="h-16 w-16 object-cover border rounded" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </div>
        </CrudDialog>
    );
}