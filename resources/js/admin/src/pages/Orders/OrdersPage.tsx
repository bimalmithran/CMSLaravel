import React, { useEffect, useMemo, useState } from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { apiFetch } from '../../lib/api';
import type { Order, PaginatedResponse } from '../../types/order';

export function OrdersPage() {
    const [items, setItems] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (o) =>
                o.order_number.toLowerCase().includes(q) ||
                o.customer_email.toLowerCase().includes(q) ||
                o.customer_name.toLowerCase().includes(q),
        );
    }, [items, search]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<PaginatedResponse<Order>>(
                '/api/v1/admin/orders',
            );
            if (!res.success) {
                setError(res.message || 'Failed to load orders');
                return;
            }
            setItems(res.data.data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Orders</div>
                    <div className="text-sm text-muted-foreground">
                        View and manage orders.
                    </div>
                </div>
                <Input
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading…
                        </div>
                    ) : error ? (
                        <div className="text-sm text-destructive">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No orders.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium">
                                            Order
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Customer
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Email
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Total
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Payment
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((o) => (
                                        <tr key={o.id} className="border-b">
                                            <td className="py-2 font-mono text-xs">
                                                {o.order_number}
                                            </td>
                                            <td className="py-2">
                                                {o.customer_name}
                                            </td>
                                            <td className="py-2">
                                                {o.customer_email}
                                            </td>
                                            <td className="py-2">{o.total}</td>
                                            <td className="py-2">
                                                {o.payment_status}
                                            </td>
                                            <td className="py-2">
                                                {o.order_status}
                                            </td>
                                            <td className="py-2">
                                                {new Date(
                                                    o.created_at,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
