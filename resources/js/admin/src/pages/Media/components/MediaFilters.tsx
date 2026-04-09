import { Search, ListFilter } from 'lucide-react';
import React from 'react';

import { Input } from '../../../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../../components/ui/select';

export interface MediaFilterState {
    search: string;
    type: string;
    date: string;
    collection_name: string;
    sort_by: string;
    sort_dir: string;
}

interface MediaFiltersProps {
    filters: MediaFilterState;
    onChange: (filters: MediaFilterState) => void;
    compact?: boolean;
}

export function MediaFilters({ filters, onChange, compact = false }: MediaFiltersProps) {
    const updateFilter = (key: keyof MediaFilterState, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className={`flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:flex-wrap ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center gap-2 font-medium text-muted-foreground w-full sm:w-auto shrink-0">
                <ListFilter className="h-4 w-4" /> Filters
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-48 lg:w-64">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search name or alt text..."
                    className="pl-8 bg-background"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                />
            </div>

            {/* Type Filter */}
            <div className="w-full sm:w-36">
                <Select value={filters.type} onValueChange={(val) => updateFilter('type', val)}>
                    <SelectTrigger className="bg-background">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="image">Images Only</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-40">
                <Select value={filters.date} onValueChange={(val) => updateFilter('date', val)}>
                    <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Uploaded Date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Collection Filter */}
            <div className="w-full sm:w-40">
                <Input
                    type="text"
                    placeholder="Collection/Folder..."
                    className="bg-background"
                    value={filters.collection_name}
                    onChange={(e) => updateFilter('collection_name', e.target.value)}
                />
            </div>

            <div className="flex-1 w-full sm:w-auto flex justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 sm:pl-4 sm:border-l">
                {/* Sort By Filter */}
                <div className="w-full sm:w-36">
                    <Select value={filters.sort_by} onValueChange={(val) => updateFilter('sort_by', val)}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">Date Uploaded</SelectItem>
                            <SelectItem value="size">File Size</SelectItem>
                            <SelectItem value="file_name">File Name</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Order */}
                <div className="w-full sm:w-32">
                    <Select value={filters.sort_dir} onValueChange={(val) => updateFilter('sort_dir', val)}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Descending</SelectItem>
                            <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
