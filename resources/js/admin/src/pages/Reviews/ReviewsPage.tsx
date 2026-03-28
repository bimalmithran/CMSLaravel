import { CheckCircle, Star, Trash2, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { apiFetch } from '../../lib/api';
import type { PaginatedResponse, Review } from '../../types/review';

function StarRating({ rating }: { rating: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                />
            ))}
        </span>
    );
}

export function ReviewsPage() {
    const [items, setItems] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    async function load(page = 1) {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (filter === 'pending') params.set('approved', 'false');
            if (filter === 'approved') params.set('approved', 'true');

            const res = await apiFetch<PaginatedResponse<Review>>(
                '/api/v1/admin/reviews?' + params.toString(),
            );
            if (!res.success) throw new Error(res.message || 'Failed to load reviews');
            setItems(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    async function setApproval(review: Review, approved: boolean) {
        setActionLoading(review.id);
        try {
            const res = await apiFetch<Review>(`/api/v1/admin/reviews/${review.id}/approval`, {
                method: 'PUT',
                json: { is_approved: approved },
            });
            if (!res.success) throw new Error(res.message || 'Failed');
            await load(currentPage);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(null);
        }
    }

    async function deleteReview(review: Review) {
        const customerName = review.customer
            ? `${review.customer.first_name} ${review.customer.last_name}`
            : 'Unknown';
        if (!confirm(`Delete review by "${customerName}"? This cannot be undone.`)) return;
        setActionLoading(review.id);
        try {
            const res = await apiFetch<unknown>(`/api/v1/admin/reviews/${review.id}`, {
                method: 'DELETE',
            });
            if (!res.success) throw new Error((res as { message?: string }).message || 'Delete failed');
            await load(currentPage);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setActionLoading(null);
        }
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (r) =>
                r.product?.name.toLowerCase().includes(q) ||
                r.customer?.first_name.toLowerCase().includes(q) ||
                r.customer?.last_name.toLowerCase().includes(q) ||
                r.customer?.email.toLowerCase().includes(q) ||
                (r.comment ?? '').toLowerCase().includes(q),
        );
    }, [items, search]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Reviews</div>
                    <div className="text-sm text-muted-foreground">
                        Approve or reject customer product reviews.
                    </div>
                </div>
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved'] as const).map((f) => (
                        <Button
                            key={f}
                            size="sm"
                            variant={filter === f ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <Input
                placeholder="Search by product, customer, or comment…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <Card>
                <CardHeader>
                    <CardTitle>
                        {filter === 'all' ? 'All Reviews' : filter === 'pending' ? 'Pending Approval' : 'Approved Reviews'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Loading…</div>
                    ) : error ? (
                        <div className="text-sm text-destructive">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No reviews found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 pr-4 text-left font-medium">Product</th>
                                        <th className="py-2 pr-4 text-left font-medium">Customer</th>
                                        <th className="py-2 pr-4 text-left font-medium">Rating</th>
                                        <th className="py-2 pr-4 text-left font-medium">Comment</th>
                                        <th className="py-2 pr-4 text-left font-medium">Status</th>
                                        <th className="py-2 pr-4 text-left font-medium">Date</th>
                                        <th className="py-2 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r) => (
                                        <tr key={r.id} className="border-b last:border-0">
                                            <td className="py-3 pr-4 font-medium">
                                                {r.product?.name ?? <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {r.customer ? (
                                                    <div>
                                                        <div>{r.customer.first_name} {r.customer.last_name}</div>
                                                        <div className="text-xs text-muted-foreground">{r.customer.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <StarRating rating={r.rating} />
                                            </td>
                                            <td className="py-3 pr-4 max-w-xs">
                                                <p className="line-clamp-2 text-muted-foreground">
                                                    {r.comment ?? <em>No comment</em>}
                                                </p>
                                            </td>
                                            <td className="py-3 pr-4">
                                                {r.is_approved ? (
                                                    <Badge variant="default" className="bg-green-600 text-white">Approved</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {r.is_approved ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="cursor-pointer h-7 px-2 text-xs"
                                                            disabled={actionLoading === r.id}
                                                            onClick={() => void setApproval(r, false)}
                                                        >
                                                            <XCircle className="mr-1 h-3.5 w-3.5 text-destructive" />
                                                            Reject
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="cursor-pointer h-7 px-2 text-xs"
                                                            disabled={actionLoading === r.id}
                                                            onClick={() => void setApproval(r, true)}
                                                        >
                                                            <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-600" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer h-7 px-2 text-destructive hover:text-destructive"
                                                        disabled={actionLoading === r.id}
                                                        onClick={() => void deleteReview(r)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                                disabled={currentPage <= 1 || loading}
                                onClick={() => void load(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {lastPage}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                                disabled={currentPage >= lastPage || loading}
                                onClick={() => void load(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
