import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { apiFetch } from '../../lib/api';
import type { AdminUser, Paginated } from '../../types/adminUser';
import { CreateAdminUserDialog } from './components/CreateAdminUserDialog';

export function AdminUsersPage() {
    const [items, setItems] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q),
        );
    }, [items, search]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<Paginated<AdminUser>>(
                '/api/v1/admin/admin-users',
            );
            if (!res.success) {
                setError(res.message || 'Failed to load admin users');
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

    async function createUser(payload: {
        name: string;
        email: string;
        password: string;
        role: AdminUser['role'];
        is_active?: boolean;
        permissions?: string[];
    }) {
        const res = await apiFetch<AdminUser>('/api/v1/admin/admin-users', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function toggleActive(user: AdminUser) {
        const res = await apiFetch<AdminUser>(
            `/api/v1/admin/admin-users/${user.id}`,
            {
                method: 'PUT',
                json: { is_active: !user.is_active },
            },
        );
        if (!res.success) {
            alert(res.message || 'Update failed');
            return;
        }
        await load();
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Admin Users</div>
                    <div className="text-sm text-muted-foreground">
                        Manage backend users and permissions.
                    </div>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <CreateAdminUserDialog onCreate={createUser} />
                </div>
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
                            No admin users.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Email
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Role
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Active
                                        </th>
                                        <th className="py-2 text-left font-medium">
                                            Permissions
                                        </th>
                                        <th className="py-2 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => (
                                        <tr key={u.id} className="border-b">
                                            <td className="py-2">{u.name}</td>
                                            <td className="py-2">{u.email}</td>
                                            <td className="py-2">{u.role}</td>
                                            <td className="py-2">
                                                {u.is_active ? 'Yes' : 'No'}
                                            </td>
                                            <td className="py-2 text-xs">
                                                {(u.permissions || []).length
                                                    ? (
                                                          u.permissions || []
                                                      ).join(', ')
                                                    : '—'}
                                            </td>
                                            <td className="py-2 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mr-2"
                                                    onClick={() =>
                                                        toggleActive(u)
                                                    }
                                                >
                                                    {u.is_active
                                                        ? 'Disable'
                                                        : 'Enable'}
                                                </Button>
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
