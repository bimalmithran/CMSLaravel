export type MediaItem = {
    id: number;
    disk: string;
    file_name: string;
    path: string;
    mime_type: string;
    size: number;
    alt_text: string | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
