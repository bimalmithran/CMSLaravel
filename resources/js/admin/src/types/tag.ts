export type Tag = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
};

export type TagPayload = {
    name: string;
    is_active: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
