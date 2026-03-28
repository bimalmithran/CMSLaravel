export type Review = {
    id: number;
    product_id: number;
    customer_id: number | null;
    rating: number;
    comment: string | null;
    is_approved: boolean;
    created_at: string;
    product: { id: number; name: string } | null;
    customer: { id: number; first_name: string; last_name: string; email: string } | null;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};
