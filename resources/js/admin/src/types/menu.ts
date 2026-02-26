export type MenuItem = {
    id: number;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    position: number;
    parent_id: number | null;
    parent: MenuItem | null;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
