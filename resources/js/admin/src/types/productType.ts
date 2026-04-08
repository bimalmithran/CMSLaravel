export interface ProductType {
    id: number;
    name: string;
    slug: string;
    model_name: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
