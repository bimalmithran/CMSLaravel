import { X } from 'lucide-react';
import React, { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog, DialogFooter } from '../../../components/CrudDialog';
import { MediaPicker } from '../../../components/MediaPicker';
import type {
    LookupItem,
    ProductTypeItem,
    SpecValue,
} from '../../../types/product';
import { SpecFormRegistry } from './specs/SpecRegistry';

export function CreateProductDialog({
    onCreate,
    categories,
    brands,
    productTypes,
}: {
    onCreate: (data: Record<string, unknown>) => Promise<void>;
    categories: LookupItem[];
    brands: LookupItem[];
    productTypes: ProductTypeItem[];
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

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

    const updateSpec = (key: string, value: SpecValue) => {
        setSpecs((prev) => ({ ...prev, [key]: value }));
    };

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({
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
            setOpen(false);
            setName('');
            setSku('');
            setPrice('');
            setStock('');
            setImage('');
            setGallery([]);
            setSpecs({});
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <CrudDialog
            open={open}
            onOpenChange={setOpen}
            title="Add New Product"
            trigger={<Button className="cursor-pointer">Add Product</Button>}
        >
            <form className="space-y-6" onSubmit={submit}>
                {/* 1. Universal Setup */}
                <div className="space-y-4 rounded-md border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold">
                        1. Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Product Type *</Label>
                            <select
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
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
                                required
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
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

                {/* 2. Dynamic Specs */}
                {DynamicSpecForm && selectedType && (
                    <div className="space-y-4 rounded-md border border-primary/20 p-4">
                        <h3 className="text-sm font-semibold text-primary">
                            2. {selectedType.name} Specifications
                        </h3>
                        <DynamicSpecForm specs={specs} onChange={updateSpec} />
                    </div>
                )}

                {/* 3. Media */}
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
                            id='isActive'
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(!!v)}
                        />
                        <Label htmlFor="isActive" className="m-0 cursor-pointer font-normal">
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
                    onCancel={() => setOpen(false)}
                    isSaving={saving}
                    saveText="Create Product"
                />
            </form>
        </CrudDialog>
    );
}
