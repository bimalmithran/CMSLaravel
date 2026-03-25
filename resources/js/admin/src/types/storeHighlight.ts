export type StoreHighlight = {
    id: number;
    icon: string;
    title: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type StoreHighlightPayload = {
    icon: string;
    title: string;
    description: string;
    sort_order?: number;
    is_active?: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

export type StoreHighlightListMeta = {
    active_count: number;
    max_active: number;
};
