import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type {
    LookupItem,
    Product,
    ProductTypeItem,
    SpecValue,
} from '../../../types/product';
import { SpecFormRegistry } from './specs/SpecRegistry';

export function EditProductDialog({
    product,
    open,
    onOpenChange,
    onUpdate,
    categories,
    brands,
    productTypes,
}: {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
    categories: LookupItem[];
    brands: LookupItem[];
    productTypes: ProductTypeItem[];
}) {
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Initial state setup
    const [categoryId, setCategoryId] = useState<number | ''>(
        product.category_id,
    );
    const [brandId, setBrandId] = useState<number | ''>(product.brand_id || '');
    const [name, setName] = useState(product.name);
    const [sku, setSku] = useState(product.sku);
    const [price, setPrice] = useState<number | ''>(product.price);
    const [stock, setStock] = useState<number | ''>(product.stock);
    const [isActive, setIsActive] = useState(product.is_active);

    const [image, setImage] = useState(product.image || '');
    const [gallery, setGallery] = useState<string[]>(product.gallery || []);

    // Load whichever spec object actually exists for this product
    const initialSpecs =
        product.jewelry_spec ||
        product.watch_spec ||
        product.diamond_spec ||
        {};
    const [specs, setSpecs] = useState<Record<string, SpecValue>>(initialSpecs);

    // Type is strictly read-only on edit
    const selectedType = productTypes.find(
        (t) => t.id === product.product_type_id,
    );
    const DynamicSpecForm = selectedType
        ? SpecFormRegistry[selectedType.slug]
        : null;

    useEffect(() => {
        // Reset state if the product changes while the modal is open
        setCategoryId(product.category_id);
        setBrandId(product.brand_id || '');
        setName(product.name);
        setSku(product.sku);
        setPrice(product.price);
        setStock(product.stock);
        setIsActive(product.is_active);
        setImage(product.image || '');
        setGallery(product.gallery || []);
        setSpecs(
            product.jewelry_spec ||
                product.watch_spec ||
                product.diamond_spec ||
                {},
        );
        setErr(null);
    }, [product]);

    const updateSpec = (key: string, value: SpecValue) => {
        setSpecs((prev) => ({ ...prev, [key]: value }));
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onUpdate(product.id, {
                product_type_id: product.product_type_id, // Immutable
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
            setErr(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Product"
        >
            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold">
                        1. Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Product Type</Label>
                            <Input
                                value={selectedType?.name || 'Unknown'}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <select
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(Number(e.target.value))
                                }
                            >
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
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
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
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>SKU *</Label>
                            <Input
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                required
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
                                required
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
                                required
                            />
                        </div>
                    </div>
                </div>

                {DynamicSpecForm && selectedType && (
                    <div className="space-y-4 rounded-md border border-primary/20 p-4">
                        <h3 className="text-sm font-semibold text-primary">
                            2. {selectedType.name} Specifications
                        </h3>
                        <DynamicSpecForm specs={specs} onChange={updateSpec} />
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">3. Media</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Primary Image</Label>
                            <MediaPicker value={image} onSelect={setImage} />
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
                                            onClick={() =>
                                                setGallery(
                                                    gallery.filter(
                                                        (_, i) => i !== idx,
                                                    ),
                                                )
                                            }
                                            className="absolute top-0 right-0 bg-destructive p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
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

                {err && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {err}
                    </div>
                )}
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    isSaving={saving}
                    saveText="Update Product"
                />
            </form>
        </CrudDialog>
    );
}
