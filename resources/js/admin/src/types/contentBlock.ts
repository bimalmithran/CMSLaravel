export type ContentBlockType = 'text' | 'html' | 'image' | 'json';

export type ContentBlock = {
    id: number;
    name: string;
    identifier: string;
    type: ContentBlockType;
    content: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type ContentBlockPayload = {
    name: string;
    identifier: string;
    type: ContentBlockType;
    content: string | null;
    is_active?: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

