import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../../components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { apiFetch } from '../../lib/api';
import { setAdminToken } from '../../lib/auth';
import type { LoginResponse } from '../../types/auth';

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await apiFetch<LoginResponse>(
                '/api/v1/admin/auth/login',
                {
                    method: 'POST',
                    json: { email, password },
                },
            );

            if (!res.success) {
                setError(res.message || 'Login failed');
                return;
            }

            setAdminToken(res.data.token);
            navigate('/', { replace: true });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error ? (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </div>
                        ) : null}

                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
