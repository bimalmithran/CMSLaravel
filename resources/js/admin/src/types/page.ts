export type Page = {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type PagePayload = {
    title: string;
    slug: string;
    content: string;
    meta_title?: string | null;
    meta_description?: string | null;
    is_active?: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

