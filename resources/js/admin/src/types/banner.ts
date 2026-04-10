export type BannerPlacement = {
    key: string;
    label: string;
    description: string | null;
    sort_order: number;
};

export type Banner = {
    id: number;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    price_text: string | null;
    button_text: string | null;
    action_url: string | null;
    image_path: string;
    tablet_image_path: string | null;
    mobile_image_path: string | null;
    placement: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type BannerPayload = {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    price_text?: string | null;
    button_text?: string | null;
    action_url?: string | null;
    image_path: string;
    tablet_image_path?: string | null;
    mobile_image_path?: string | null;
    placement: string;
    sort_order?: number;
    is_active?: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
