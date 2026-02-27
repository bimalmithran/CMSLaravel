import {
    FolderTree,
    GalleryVerticalEnd,
    Images,
    LayoutDashboard,
    List,
    LogOut,
    Moon,
    Package,
    ScrollText,
    Ruler,
    Settings,
    ShoppingCart,
    Square,
    Sun,
    UserCog,
    Users,
} from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '../../../components/ui/sidebar';

import { apiFetch } from '../lib/api';
import { clearAdminToken } from '../lib/auth';

// --- THEME PROVIDER LOGIC ---

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
    undefined
);

function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'tt-admin-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light';

            root.classList.add(systemTheme);
            return;
        }

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

// --- MODE TOGGLE COMPONENT ---

export function ModeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="cursor-pointer">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('dark')}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('system')}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// --- MAIN LAYOUT COMPONENT ---

export function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    async function logout() {
        await apiFetch('/api/v1/admin/auth/logout', { method: 'POST' });
        clearAdminToken();
        navigate('/login', { replace: true });
    }

    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/menus', label: 'Menus', icon: List },
        { to: '/categories', label: 'Categories', icon: FolderTree },
        { to: '/brands', label: 'Brands', icon: Square },
        { to: '/banners', label: 'Banners', icon: Images },
        { to: '/sizes', label: 'Sizes', icon: Ruler },
        { to: '/products', label: 'Products', icon: Package },
        { to: '/pages', label: 'Pages', icon: ScrollText },
        { to: '/orders', label: 'Orders', icon: ShoppingCart },
        { to: '/admin-users', label: 'Admin Users', icon: UserCog },
        { to: '/customers', label: 'Customers', icon: Users },
        { to: '/media', label: 'Media', icon: Images },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <ThemeProvider defaultTheme="system" storageKey="tt-admin-theme">
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarHeader className="p-4">
                        <div className="flex items-center gap-2 font-semibold">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <GalleryVerticalEnd className="h-4 w-4" />
                            </div>
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                TT Admin
                            </span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                                Application
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => {
                                        const isActive = item.end
                                            ? location.pathname === item.to
                                            : location.pathname.startsWith(item.to);

                                        return (
                                            <SidebarMenuItem key={item.to}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.label}
                                                >
                                                    <NavLink to={item.to} end={item.end}>
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={logout}
                                    className="cursor-pointer"
                                    tooltip="Logout"
                                >
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex flex-1 flex-col overflow-hidden min-h-screen">
                    {/* Header updated to include the Theme Toggle on the right */}
                    <header className="flex h-14 items-center gap-2 border-b px-4 lg:h-[60px] lg:px-6">
                        <SidebarTrigger className="-ml-1 cursor-pointer" />
                        <div className="ml-auto">
                            <ModeToggle />
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
                        <Outlet />
                    </main>
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
}
