export type MenuItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    menu_type: 'link' | 'dropdown' | 'product_listing';
    page_id: number | null;
    page: {
        id: number;
        title: string;
        slug: string;
        is_active?: boolean;
    } | null;
    is_active: boolean;
    position: number;
    parent_id: number | null;
    parent: MenuItem | null;
    placement: 'header' | 'footer';
};

export type PageListItem = {
    id: number;
    title: string;
    slug: string;
    is_active: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
