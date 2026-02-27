import { X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';

import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';

import { CrudDialog } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type { Step } from '../../../components/ui/multi-step-form';
import { MultiStepForm } from '../../../components/ui/multi-step-form';
import type {
    LookupItem,
    Product,
    ProductTypeItem,
    SpecValue,
} from '../../../types/product';
import { SpecFormRegistry } from './specs/SpecRegistry';

interface EditProductProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
    categories: LookupItem[];
    brands: LookupItem[];
    productTypes: ProductTypeItem[];
}

export function EditProductDialog({
    product,
    open,
    onOpenChange,
    onUpdate,
    categories,
    brands,
    productTypes,
}: EditProductProps) {
    const [saving, setSaving] = useState(false);

    // Form State
    const [typeId, setTypeId] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [brandId, setBrandId] = useState<number | ''>('');
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>('');
    const [isActive, setIsActive] = useState(true);
    const [image, setImage] = useState('');
    const [gallery, setGallery] = useState<string[]>([]);
    const [specs, setSpecs] = useState<Record<string, SpecValue>>({});

    const selectedType = productTypes.find((t) => t.id === typeId);
    const DynamicSpecForm = selectedType
        ? SpecFormRegistry[selectedType.slug]
        : null;

    useEffect(() => {
        if (open && product) {
            setTypeId(product.product_type_id ?? '');
            setCategoryId(product.category_id ?? '');
            setBrandId(product.brand_id ?? '');
            setName(product.name ?? '');
            setSku(product.sku ?? '');
            setPrice(product.price ?? '');
            setStock(product.stock ?? '');
            setIsActive(product.is_active ?? true);
            setImage(product.image ?? '');
            setGallery(product.gallery || []);

            // FIX: Explicitly cast the specs to satisfy the strict linter
            setSpecs(
                (product.specs as Record<string, SpecValue>) ||
                    (product.diamond_spec as Record<string, SpecValue>) ||
                    (product.jewelry_spec as Record<string, SpecValue>) ||
                    (product.watch_spec as Record<string, SpecValue>) ||
                    ({} as Record<string, SpecValue>),
            );
        }
    }, [open, product]);

    const updateSpec = (key: string, value: SpecValue) => {
        setSpecs((prev) => ({ ...prev, [key]: value }));
    };

    const formSteps: Step[] = useMemo(
        () => [
            {
                label: 'Basic Info',
                validate: () => {
                    if (!typeId) return 'Product Type is required.';
                    if (!categoryId) return 'Category is required.';
                    if (!name.trim()) return 'Product Name is required.';
                    if (!sku.trim()) return 'SKU is required.';
                    if (price === '' || Number(price) < 0)
                        return 'A valid Base Price is required.';
                    if (stock === '' || Number(stock) < 0)
                        return 'A valid Base Stock is required.';
                    return null;
                },
                content: (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Product Type *</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                                    value={typeId}
                                    onChange={(e) =>
                                        setTypeId(Number(e.target.value))
                                    }
                                >
                                    <option value="" disabled>
                                        Select Type...
                                    </option>
                                    {productTypes.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                                    value={categoryId}
                                    onChange={(e) =>
                                        setCategoryId(Number(e.target.value))
                                    }
                                >
                                    <option value="" disabled>
                                        Select Category...
                                    </option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Brand / Collection</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                                    value={brandId}
                                    onChange={(e) =>
                                        setBrandId(
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value),
                                        )
                                    }
                                >
                                    <option value="">(None)</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Product Name *</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SKU *</Label>
                                <Input
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Base Price (₹) *</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(Number(e.target.value))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Base Stock *</Label>
                                <Input
                                    type="number"
                                    value={stock}
                                    onChange={(e) =>
                                        setStock(Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                label: 'Specifications',
                content: (
                    <div className="space-y-4">
                        {DynamicSpecForm && selectedType ? (
                            <DynamicSpecForm
                                specs={specs}
                                onChange={updateSpec}
                            />
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Please select a Product Type in Step 1 to load
                                specific attributes.
                            </div>
                        )}
                    </div>
                ),
            },
            {
                label: 'Media',
                content: (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Primary Image</Label>
                                <MediaPicker
                                    value={image}
                                    onSelect={setImage}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gallery Images</Label>
                                <div className="mb-2 flex flex-wrap gap-2">
                                    {gallery.map((url, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative h-16 w-16 overflow-hidden rounded border"
                                        >
                                            <img
                                                src={url}
                                                alt="gallery"
                                                className="h-full w-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() =>
                                                    setGallery(
                                                        gallery.filter(
                                                            (_, i) => i !== idx,
                                                        ),
                                                    )
                                                }
                                                className="absolute top-0 right-0 h-6 w-6 rounded-none p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <MediaPicker
                                        onSelect={(url) =>
                                            setGallery([...gallery, url])
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <Field
                                orientation="horizontal"
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    checked={isActive}
                                    onCheckedChange={(v) => setIsActive(!!v)}
                                />
                                <Label className="m-0 cursor-pointer font-normal">
                                    Active & Visible in Store
                                </Label>
                            </Field>
                        </div>
                    </div>
                ),
            },
        ],
        [
            typeId,
            categoryId,
            brandId,
            name,
            sku,
            price,
            stock,
            isActive,
            image,
            gallery,
            specs,
            productTypes,
            categories,
            brands,
            DynamicSpecForm,
            selectedType,
        ],
    );

    async function handleFinalSubmit() {
        setSaving(true);
        try {
            await onUpdate(product.id, {
                product_type_id: typeId,
                category_id: categoryId,
                brand_id: brandId === '' ? null : brandId,
                name,
                sku,
                price: Number(price),
                stock: Number(stock),
                is_active: isActive,
                image: image || null,
                gallery: gallery.length > 0 ? gallery : null,
                specs,
            });
            onOpenChange(false);
        } catch (e) {
            throw new Error(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    if (!product) return null;

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Edit Product: ${product.name}`}
            size="xl"
        >
            <MultiStepForm
                key={open ? `open-${product.id}` : 'closed'}
                steps={formSteps}
                onSubmit={handleFinalSubmit}
                onCancel={() => onOpenChange(false)}
                saving={saving}
                saveText="Save Changes"
            />
        </CrudDialog>
    );
}
