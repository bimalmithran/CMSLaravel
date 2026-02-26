export type Setting = {
    id: number;
    key: string;
    value: string | null;
    type: string; // 'text', 'textarea', 'image'
    group: string; // 'general', 'contact', 'social'
};
