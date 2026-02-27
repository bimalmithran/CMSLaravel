import { clearAdminToken, getAdminToken } from './auth';

export type ApiResponse<T> =
    | { success: true; data: T; message?: string }
    | { success: false; message: string; data?: unknown; errors?: string[] };

const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function apiFetch<T>(
    path: string,
    init: RequestInit & { json?: unknown } = {},
): Promise<ApiResponse<T>> {
    const token = getAdminToken();

    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    if (init.headers) {
        for (const [k, v] of Object.entries(
            init.headers as Record<string, string>,
        )) {
            if (typeof v === 'string') headers[k] = v;
        }
    }

    let body = init.body;
    if (init.json !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(init.json);
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
        body,
    });

    if (res.status === 401) {
        clearAdminToken();
    }

    const text = await res.text();
    try {
        return JSON.parse(text) as ApiResponse<T>;
    } catch {
        return {
            success: false,
            message: 'Invalid server response',
            data: text,
        };
    }
}
