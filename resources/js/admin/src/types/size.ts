export type Size = {
    id: number;
    name: string;
    type: string;
};

export type SizePayload = {
    name: string;
    type: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

// Extracted constant for reuse
export const SIZE_TYPES = ['ring', 'bangle', 'chain', 'necklace', 'bracelet', 'watch'];
