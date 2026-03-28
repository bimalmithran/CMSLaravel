import { CheckCheck, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { apiFetch } from '../../lib/api';
import type { ContactInquiry, PaginatedResponse } from '../../types/contactInquiry';

export function ContactInquiriesPage() {
    const [items, setItems] = useState<ContactInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const autoReadRef = useRef<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    async function load(page = 1) {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<PaginatedResponse<ContactInquiry>>(
                `/api/v1/admin/contact-inquiries?page=${page}`,
            );
            if (!res.success) throw new Error(res.message || 'Failed to load inquiries');
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
        void load();
    }, []);

    async function markRead(inquiry: ContactInquiry, silent = false) {
        if (inquiry.is_read) return;
        if (!silent) setActionLoading(inquiry.id);
        try {
            const res = await apiFetch<unknown>(
                `/api/v1/admin/contact-inquiries/${inquiry.id}/read`,
                { method: 'PUT' },
            );
            if (!res.success) throw new Error((res as { message?: string }).message || 'Failed');
            setItems((prev) =>
                prev.map((i) => (i.id === inquiry.id ? { ...i, is_read: true } : i)),
            );
        } catch {
            // silent auto-read failures are ignored
        } finally {
            if (!silent) setActionLoading(null);
        }
    }

    // Auto-mark unread inquiries as read after they appear on screen
    useEffect(() => {
        items.forEach((inq) => {
            if (!inq.is_read && !autoReadRef.current.has(inq.id)) {
                autoReadRef.current.add(inq.id);
                void markRead(inq, true);
            }
        });
    }, [items]);

    async function deleteInquiry(inquiry: ContactInquiry) {
        if (!confirm(`Delete inquiry from "${inquiry.name}"? This cannot be undone.`)) return;
        setActionLoading(inquiry.id);
        try {
            const res = await apiFetch<unknown>(
                `/api/v1/admin/contact-inquiries/${inquiry.id}`,
                { method: 'DELETE' },
            );
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
            (i) =>
                i.name.toLowerCase().includes(q) ||
                i.email.toLowerCase().includes(q) ||
                (i.subject ?? '').toLowerCase().includes(q) ||
                i.message.toLowerCase().includes(q),
        );
    }, [items, search]);

    const unreadCount = items.filter((i) => !i.is_read).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        Contact Inquiries
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount} new</Badge>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Messages sent via the Contact Us page.
                    </div>
                </div>
            </div>

            <Input
                placeholder="Search by name, email, or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Loading…</div>
                    ) : error ? (
                        <div className="text-sm text-destructive">{error}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No inquiries found.</div>
                    ) : (
                        <div className="divide-y">
                            {filtered.map((inq) => (
                                <div
                                    key={inq.id}
                                    className={`py-4 first:pt-0 last:pb-0 transition-colors ${!inq.is_read ? 'rounded-lg border border-primary/30 bg-primary/5 px-4' : ''}`}
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{inq.name}</span>
                                                {!inq.is_read && (
                                                    <Badge variant="secondary" className="text-xs">New</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                                                {' · '}
                                                {new Date(inq.created_at).toLocaleString()}
                                            </div>
                                            {inq.subject && (
                                                <div className="mt-0.5 text-sm font-medium text-foreground/80">
                                                    Subject: {inq.subject}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {!inq.is_read && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="cursor-pointer h-7 px-2 text-xs"
                                                    disabled={actionLoading === inq.id}
                                                    onClick={() => void markRead(inq)}
                                                >
                                                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="cursor-pointer h-7 px-2 text-destructive hover:text-destructive"
                                                disabled={actionLoading === inq.id}
                                                onClick={() => void deleteInquiry(inq)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-md bg-muted p-3 text-sm whitespace-pre-wrap leading-relaxed">
                                        {inq.message}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
