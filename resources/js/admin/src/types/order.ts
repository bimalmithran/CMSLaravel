export type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  created_at: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};
