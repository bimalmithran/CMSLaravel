import type {
    ColumnDef,
    SortingState,
    VisibilityState} from '@tanstack/react-table';
import { // <-- New import
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react'; // <-- New import for the button icon
import React from 'react';

import { Button } from '../../../components/ui/button'; // <-- Ensure Button is imported
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'; // <-- New imports for the visibility toggle
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '../../../components/ui/input-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table';
import { DataTablePagination } from './DataTablePagination';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    currentPage: number;
    lastPage: number;
    search: string;
    onSearch: (value: string) => void;
    onPageChange: (page: number) => void;
    sorting: SortingState;
    onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
    loading?: boolean;
    emptyMessage?: string;
    error?: string | null;
    title?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    currentPage,
    lastPage,
    search,
    onSearch,
    onPageChange,
    sorting,
    onSortingChange,
    loading = false,
    emptyMessage = 'No items found.',
    error = null,
    title = 'List',
}: DataTableProps<TData, TValue>) {
    // NEW: Manage column visibility state
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        onSortingChange: onSortingChange,
        onColumnVisibilityChange: setColumnVisibility, // <-- Handle visibility changes
        state: {
            sorting,
            columnVisibility, // <-- Bind visibility state
        },
        meta: {
            currentPage,
        },
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        onPageChange(1);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{title}</CardTitle>
                <div className="flex items-center gap-2"> {/* <-- Group search and columns button */}
                    <div className="w-64">
                        <form onSubmit={handleSearch}>
                            <InputGroup>
                                <InputGroupInput
                                    placeholder="Type to search..."
                                    value={search}
                                    onChange={(e) => onSearch(e.target.value)}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="submit"
                                        variant="secondary"
                                        className="cursor-pointer"
                                    >
                                        Search
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </form>
                    </div>

                    {/* NEW: Columns Dropdown Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="cursor-pointer">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize cursor-pointer"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {/* Replace underscores with spaces for prettier labels */}
                                            {column.id.replace('_', ' ')}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {/* ... (The rest of CardContent with error, table, and pagination remains exactly the same) */}
                {error && (
                    <div className="mb-4 text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading…
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => {
                                                        return (
                                                            <TableHead
                                                                key={header.id}
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                          header
                                                                              .column
                                                                              .columnDef
                                                                              .header,
                                                                          header.getContext(),
                                                                      )}
                                                            </TableHead>
                                                        );
                                                    },
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    'selected'
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                {emptyMessage}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!loading && data.length > 0 && (
                        <DataTablePagination
                            currentPage={currentPage}
                            lastPage={lastPage}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
