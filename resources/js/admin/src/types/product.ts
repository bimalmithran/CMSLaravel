export type SpecValue = string | number | boolean | null;

export type ProductTypeItem = { id: number; name: string; slug: string };
export type LookupItem = { id: number; name: string };
export type SizeItem = { id: number; name: string; type: string };

export type Product = {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    is_active: boolean;
    image: string | null;
    gallery: string[] | null;
    product_type_id: number;
    category_id: number;
    brand_id: number | null;
    productType?: ProductTypeItem;
    category?: LookupItem;
    brand?: LookupItem;
    jewelry_spec?: Record<string, SpecValue>;
    watch_spec?: Record<string, SpecValue>;
    diamond_spec?: Record<string, SpecValue>;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

// Interface for all dynamic spec components to adhere to
export interface SpecFormProps {
    specs: Record<string, SpecValue>;
    onChange: (key: string, value: SpecValue) => void;
}
