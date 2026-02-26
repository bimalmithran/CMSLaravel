import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../../../components/ui/dialog';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import type { AdminUser } from '../../../types/adminUser';

export function CreateAdminUserDialog({
    onCreate,
}: {
    onCreate: (payload: {
        name: string;
        email: string;
        password: string;
        role: AdminUser['role'];
        is_active?: boolean;
        permissions?: string[];
    }) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<AdminUser['role']>('admin');
    const [permissions, setPermissions] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setErr(null);
        try {
            await onCreate({
                name,
                email,
                password,
                role,
                is_active: isActive,
                permissions: permissions
                    .split(',')
                    .map((p) => p.trim())
                    .filter(Boolean),
            });
            setOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setPermissions('');
            setRole('admin');
            setIsActive(true);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Admin User</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={submit}>
                    <div className="space-y-2">
                        <Label htmlFor="admin-name">Name</Label>
                        <Input
                            id="admin-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                            id="admin-password"
                            type="password"
                            value={password}
                            minLength={8}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="admin-role">Role</Label>
                            <select
                                id="admin-role"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onChange={(e) =>
                                    setRole(e.target.value as AdminUser['role'])
                                }
                            >
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-active">Active (1/0)</Label>
                            <Input
                                id="admin-active"
                                type="number"
                                value={isActive ? '1' : '0'}
                                onChange={(e) =>
                                    setIsActive(e.target.value !== '0')
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="admin-perms">
                            Permissions (comma separated)
                        </Label>
                        <Input
                            id="admin-perms"
                            placeholder="products.view,products.create,categories.*"
                            value={permissions}
                            onChange={(e) => setPermissions(e.target.value)}
                        />
                    </div>

                    {err ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {err}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
