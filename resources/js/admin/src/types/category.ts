export type Category = {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    image: string | null;
    parent: { id: number; name: string } | null;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
