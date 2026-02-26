export type MediaItem = {
    id: number;
    file_name: string;
    path: string;
    mime_type: string;
    size: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};