export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'staff';
  is_active: boolean;
  permissions: string[] | null;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};
