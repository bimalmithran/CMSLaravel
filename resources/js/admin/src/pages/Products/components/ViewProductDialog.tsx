import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Button } from '../../../../../components/ui/button';
import { CrudDialog } from '../../../components/CrudDialog';
import type { Product } from '../../../types/product';

interface ViewProductDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({
    product,
    open,
    onOpenChange,
}: ViewProductDialogProps) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Combine primary image and gallery images into a single array for the slider
    const allImages = useMemo(() => {
        if (!product) return [];
        const images: string[] = [];
        if (product.image) images.push(product.image);
        if (product.gallery && Array.isArray(product.gallery)) {
            images.push(...product.gallery);
        }
        return images;
    }, [product]);

    // Reset slider to first image when dialog opens
    React.useEffect(() => {
        if (open) setCurrentImgIndex(0);
    }, [open]);

    const nextImage = () =>
        setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
    const prevImage = () =>
        setCurrentImgIndex(
            (prev) => (prev - 1 + allImages.length) % allImages.length,
        );

    if (!product) return null;

    // Safely extract specs, falling back through the legacy names if unified 'specs' isn't set yet
    const productSpecs =
        product.specs ||
        product.diamond_spec ||
        product.jewelry_spec ||
        product.watch_spec ||
        {};
    const hasSpecs = Object.keys(productSpecs).length > 0;

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Product Details"
            size="xl"
        >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* LEFT COLUMN: Image Slider */}
                <div className="flex flex-col space-y-4">
                    {allImages.length > 0 ? (
                        <>
                            {/* Main Active Image */}
                            <div className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                                <img
                                    src={allImages[currentImgIndex]}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                                {/* Slider Controls (Only show if multiple images) */}
                                {allImages.length > 1 && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={prevImage}
                                            className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={nextImage}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Strip */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() =>
                                                setCurrentImgIndex(idx)
                                            }
                                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                                                currentImgIndex === idx
                                                    ? 'border-primary'
                                                    : 'border-transparent hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${idx}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                            No Images Available
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Product Information */}
                <div className="flex flex-col space-y-6">
                    {/* Header Info */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {product.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                                SKU: {product.sku}
                            </span>
                            {product.productType && (
                                <span>Type: {product.productType.name}</span>
                            )}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                                {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Base Price
                            </p>
                            <p className="text-lg font-semibold">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Base Stock
                            </p>
                            <p className="text-lg font-semibold">
                                {product.stock} units
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Category
                            </p>
                            <p className="font-medium">
                                {product.category?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Brand
                            </p>
                            <p className="font-medium">
                                {product.brand?.name || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Specifications */}
                    {hasSpecs && (
                        <div className="space-y-3">
                            <h3 className="border-b pb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Specifications
                            </h3>
                            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                                {Object.entries(productSpecs).map(
                                    ([key, value]) => {
                                        // Format the key (e.g., "metal_type" -> "Metal Type")
                                        const formattedKey = key
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase(),
                                            );

                                        // Format the value (handle arrays gracefully)
                                        const formattedValue = Array.isArray(
                                            value,
                                        )
                                            ? value.join(', ')
                                            : String(value || 'N/A');

                                        return (
                                            <div
                                                key={key}
                                                className="flex flex-col border-b border-muted/50 pb-1 last:border-0"
                                            >
                                                <span className="text-xs text-muted-foreground">
                                                    {formattedKey}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formattedValue}
                                                </span>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                </Button>
            </div>
        </CrudDialog>
    );
}
