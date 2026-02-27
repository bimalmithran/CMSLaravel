export type Banner = {
    id: number;
    title: string | null;
    subtitle: string | null;
    action_url: string | null;
    image_path: string;
    placement: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type BannerPayload = {
    title?: string | null;
    subtitle?: string | null;
    action_url?: string | null;
    image_path: string;
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

