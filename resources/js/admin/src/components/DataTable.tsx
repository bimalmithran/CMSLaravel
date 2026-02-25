import {
    DeleteIcon,
    EditIcon,
    EllipsisVerticalIcon,
    ViewIcon,
} from 'lucide-react';
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '../../../components/ui/input-group';
import { DataTablePagination } from './DataTablePagination';

export interface DataTableColumn<T> {
    key: string;
    label: string;
    render?: (
        value: unknown,
        item: T,
        index: number,
        currentPage: number,
    ) => React.ReactNode;
}

interface DataTableProps<T> {
    items: T[];
    columns: DataTableColumn<T>[];
    currentPage: number;
    lastPage: number;
    search: string;
    onSearch: (value: string) => void;
    onPageChange: (page: number) => void;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    error?: string | null;
    title?: string;
}

export function DataTable<T extends { id: number }>({
    items,
    columns,
    currentPage,
    lastPage,
    search,
    onSearch,
    onPageChange,
    onView,
    onEdit,
    onDelete,
    loading = false,
    emptyMessage = 'No items found.',
    error = null,
    title = 'List',
}: DataTableProps<T>) {
    const handleSearch = async (e: React.SubmitEvent) => {
        e.preventDefault();
        onPageChange(1);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="w-64">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => onSearch(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    await handleSearch({
                                        preventDefault: () => {},
                                    } as React.SubmitEvent);
                                }
                            }}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={async () => onPageChange(1)}
                            >
                                Search
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="text-sm text-destructive mb-4">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Loading…</div>
                    ) : items.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b">
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className={`py-2 font-medium ${
                                                    col.key === 'actions'
                                                        ? 'text-right'
                                                        : 'text-left'
                                                }`}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        {(onView || onEdit || onDelete) && (
                                            <th className="py-2 text-right font-medium">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={item.id} className="border-b">
                                            {columns.map((col) => (
                                                <td
                                                    key={`${item.id}-${col.key}`}
                                                    className={`py-2 ${
                                                        col.key === 'actions'
                                                            ? 'text-right'
                                                            : ''
                                                    }`}
                                                >
                                                    {col.render
                                                        ? col.render(
                                                              item[
                                                                  col.key as keyof T
                                                              ],
                                                              item,
                                                              index,
                                                              currentPage,
                                                          )
                                                        : String(
                                                              item[
                                                                  col.key as keyof T
                                                              ],
                                                          )}
                                                </td>
                                            ))}
                                            {(onView || onEdit || onDelete) && (
                                                <td className="py-2 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="cursor-pointer"
                                                            >
                                                                <EllipsisVerticalIcon />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            {onView && (
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() =>
                                                                        onView(item)
                                                                    }
                                                                >
                                                                    <ViewIcon />
                                                                    View
                                                                </DropdownMenuItem>
                                                            )}
                                                            {onEdit && (
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() =>
                                                                        onEdit(item)
                                                                    }
                                                                >
                                                                    <EditIcon />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            {onDelete && (
                                                                <>
                                                                    {(onView ||
                                                                        onEdit) && (
                                                                        <DropdownMenuSeparator />
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        className="cursor-pointer"
                                                                        onClick={() =>
                                                                            onDelete(
                                                                                item,
                                                                            )
                                                                        }
                                                                    >
                                                                        <DeleteIcon />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <DataTablePagination
                                currentPage={currentPage}
                                lastPage={lastPage}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
