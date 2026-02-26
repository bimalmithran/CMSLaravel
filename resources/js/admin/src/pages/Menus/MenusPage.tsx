import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    ArrowUpDown,
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';

import { Button } from '../../../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';

import { DataTable } from '../../components/DataTable';
import { apiFetch } from '../../lib/api';
import type { MenuItem, PaginatedResponse } from '../../types/menu';

import { CreateMenuDialog } from './components/CreateMenuDialog';
import { EditMenuDialog } from './components/EditMenuDialog';
import { ViewMenuDialog } from './components/ViewMenuDialog';

export function MenusPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [parents, setParents] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [viewMenu, setViewMenu] = useState<MenuItem | null>(null);
    const [editMenu, setEditMenu] = useState<MenuItem | null>(null);

    const load = React.useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.append('page', String(page));
                if (search) params.append('search', search);

                if (sorting.length > 0) {
                    const activeSort = sorting[0];
                    params.append('sort_by', activeSort.id);
                    params.append('sort_dir', activeSort.desc ? 'desc' : 'asc');
                }

                const res = await apiFetch<PaginatedResponse<MenuItem>>(
                    '/api/v1/admin/menus?' + params.toString(),
                );
                if (!res.success) {
                    setError(res.message || 'Failed to load menus');
                    return;
                }
                setItems(res.data.data);
                setCurrentPage(res.data.current_page);
                setLastPage(res.data.last_page);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        },
        [search, sorting],
    );

    const loadParents = React.useCallback(async () => {
        try {
            const res = await apiFetch<MenuItem[]>('/api/v1/admin/menus/list');
            if (res.success) {
                setParents(res.data);
            }
        } catch (err) {
            console.error('Failed to load parent menus', err);
        }
    }, []);

    useEffect(() => {
        load().catch(console.error);
        loadParents().catch(console.error);
    }, [load, loadParents]);

    async function createMenu(payload: Record<string, unknown>) {
        const res = await apiFetch<MenuItem>('/api/v1/admin/menus', {
            method: 'POST',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Create failed');
        await load();
    }

    async function updateMenu(id: number, payload: Record<string, unknown>) {
        const res = await apiFetch<MenuItem>(`/api/v1/admin/menus/${id}`, {
            method: 'PUT',
            json: payload,
        });
        if (!res.success) throw new Error(res.message || 'Update failed');
        await load(currentPage);
    }

    async function deleteMenu(item: MenuItem) {
        if (!confirm('Delete this menu item?')) return;
        const res = await apiFetch<unknown>(`/api/v1/admin/menus/${item.id}`, {
            method: 'DELETE',
        });
        if (!res.success) {
            alert(res.message || 'Delete failed');
            return;
        }
        await load();
    }

    const columns = useMemo<ColumnDef<MenuItem>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                enableHiding: false,
                cell: ({ row, table }) => {
                    const meta = table.options.meta as { currentPage: number };
                    return (meta.currentPage - 1) * 10 + row.index + 1;
                },
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'parent',
                accessorKey: 'parent',
                header: 'Parent',
                cell: ({ row }) => row.original.parent?.name ?? '(none)',
            },
            {
                id: 'description',
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => row.original.description ?? '(none)',
            },
            {
                id: 'position',
                accessorKey: 'position',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="-ml-4 cursor-pointer"
                    >
                        Position <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'active',
                accessorKey: 'is_active',
                header: 'Active',
                cell: ({ row }) => (row.original.is_active ? 'Yes' : 'No'),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 cursor-pointer p-0"
                                    >
                                        <span className="sr-only">
                                            Open menu
                                        </span>
                                        <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setViewMenu(item)}
                                    >
                                        <ViewIcon className="mr-2 h-4 w-4" />{' '}
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => setEditMenu(item)}
                                    >
                                        <EditIcon className="mr-2 h-4 w-4" />{' '}
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer text-destructive"
                                        onClick={() => deleteMenu(item)}
                                    >
                                        <DeleteIcon className="mr-2 h-4 w-4" />{' '}
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">Menus</div>
                    <div className="text-sm text-muted-foreground">
                        Manage product menus.
                    </div>
                </div>
                <CreateMenuDialog onCreate={createMenu} parents={parents} />
            </div>

            <DataTable<MenuItem, unknown>
                data={items}
                columns={columns}
                currentPage={currentPage}
                lastPage={lastPage}
                search={search}
                onSearch={setSearch}
                onPageChange={(page) => void load(page)}
                sorting={sorting}
                onSortingChange={setSorting}
                loading={loading}
                emptyMessage="No menus."
                error={error}
                title="List"
            />

            {viewMenu && (
                <ViewMenuDialog
                    menu={viewMenu}
                    open={!!viewMenu}
                    onOpenChange={(o) => {
                        if (!o) setViewMenu(null);
                    }}
                />
            )}
            {editMenu && (
                <EditMenuDialog
                    menu={editMenu}
                    parents={parents}
                    open={!!editMenu}
                    onOpenChange={(o) => {
                        if (!o) setEditMenu(null);
                    }}
                    onUpdate={updateMenu}
                />
            )}
        </div>
    );
}
