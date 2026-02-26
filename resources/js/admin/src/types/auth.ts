export type LoginResponse = {
    admin: { id: number; name: string; email: string };
    token: string;
};
