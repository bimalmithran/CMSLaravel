export type Testimonial = {
    id: number;
    customer_name: string;
    designation_or_location: string | null;
    content: string;
    rating: number;
    image_path: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type TestimonialPayload = {
    customer_name: string;
    designation_or_location?: string | null;
    content: string;
    rating: number;
    image_path?: string | null;
    sort_order?: number;
    is_active?: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

