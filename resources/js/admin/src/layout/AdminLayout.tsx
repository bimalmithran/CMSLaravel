import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '../../../components/ui/button';
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../../../components/ui/sheet';

import { apiFetch } from '../lib/api';
import { clearAdminToken } from '../lib/auth';

const linkBase =
    'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted';
const linkActive = 'bg-muted font-medium';

export function AdminLayout() {
    const navigate = useNavigate();

    async function logout() {
        await apiFetch('/api/v1/admin/auth/logout', { method: 'POST' });
        clearAdminToken();
        navigate('/login', { replace: true });
    }

    const [menuOpen, setMenuOpen] = useState(false);

    // shared nav links array for reuse
    const navItems = [
        { to: '/', label: 'Dashboard', end: true },
        { to: '/menus', label: 'Menus' },
        { to: '/categories', label: 'Categories' },
        { to: '/products', label: 'Products' },
        { to: '/orders', label: 'Orders' },
        { to: '/admin-users', label: 'Admin Users' },
        { to: '/customers', label: 'Customers' },
    ];

    const renderLinks = (closeSheet?: () => void) => (
        <nav className="space-y-1">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : ''}`
                    }
                    onClick={closeSheet}
                >
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* header with hamburger on mobile */}
            <div className="flex h-14 items-center justify-between border-b px-4">
                <div className="flex items-center gap-2">
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-4">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                            </SheetHeader>
                            {renderLinks(() => setMenuOpen(false))}
                        </SheetContent>
                    </Sheet>
                    <span className="font-semibold">TT Admin</span>
                </div>
                <Button variant="outline" onClick={logout}>
                    Logout
                </Button>
            </div>

            {/* layout grid */}
            <div className="grid grid-cols-12 gap-4 px-4 py-6">
                <aside className="col-span-12 hidden md:col-span-3 md:block lg:col-span-2">
                    {renderLinks()}
                </aside>

                <main className="col-span-12 md:col-span-9 lg:col-span-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
