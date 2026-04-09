import { Image as ImageIcon, Loader2, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { MediaFilters, MediaFilterState } from '../pages/Media/components/MediaFilters';

import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { apiFetch } from '../lib/api';

type MediaItem = {
    id: number;
    file_name: string;
    path: string;
    mime_type: string;
};

// Laravel's pagination wrapper
type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
};

interface MediaPickerProps {
    value?: string | null;
    onSelect: (url: string) => void;
    onSelectMedia?: (media: { id: number; path: string } | null) => void;
}

export function MediaPicker({ value, onSelect, onSelectMedia }: MediaPickerProps) {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const observerTarget = useRef<HTMLDivElement>(null);

    const [filters, setFilters] = useState<MediaFilterState>({
        search: '', type: 'all', date: 'all', collection_name: '', sort_by: 'created_at', sort_dir: 'desc'
    });
    const [filtersOpen, setFiltersOpen] = useState(false);

    const loadMedia = useCallback((targetPage: number = 1, currentFilters = filters, append: boolean = false) => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(targetPage) });
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.type && currentFilters.type !== 'all') params.append('type', currentFilters.type);
        if (currentFilters.date && currentFilters.date !== 'all') params.append('date', currentFilters.date);
        if (currentFilters.collection_name) params.append('collection_name', currentFilters.collection_name);
        if (currentFilters.sort_by) params.append('sort_by', currentFilters.sort_by);
        if (currentFilters.sort_dir) params.append('sort_dir', currentFilters.sort_dir);

        apiFetch<Paginated<MediaItem>>(`/api/v1/admin/media?${params.toString()}`)
            .then((res) => {
                if (res.success) {
                    setMedia(prev => append ? [...prev, ...res.data.data] : res.data.data);
                    setPage(res.data.current_page);
                    setLastPage(res.data.last_page);
                }
            })
            .catch((err) => console.error('Failed to fetch media:', err))
            .finally(() => setLoading(false));
    }, []);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && page < lastPage) {
                    loadMedia(page + 1, filters, true);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loading, page, lastPage, loadMedia, filters]);

    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (isOpen && media.length === 0) {
            loadMedia(1, filters, false); // Load first page when opened
        }
    }

    async function handleInlineUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await apiFetch<MediaItem>('/api/v1/admin/media', {
                method: 'POST',
                body: formData,
            });

            if (res.success) {
                // Instantly select the newly uploaded image!
                handleSelect({ id: res.data.id, path: res.data.path });
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    }

    function handleSelect(item: { id: number; path: string }) {
        onSelect(item.path);
        onSelectMedia?.(item);
        setOpen(false);
    }

    return (
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {value ? (
                    <img src={value} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button variant="outline" type="button" className="cursor-pointer">
                            Browse Media
                        </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-[1400px] sm:max-w-[1400px] w-[95vw] max-h-[95vh] flex flex-col">
                        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                            <DialogTitle>Select Media</DialogTitle>
                            
                            {/* INLINE UPLOAD BUTTON */}
                            <Label htmlFor="picker-upload" className="cursor-pointer m-0 mr-8">
                                <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploading ? 'Uploading...' : 'Upload New'}
                                </div>
                                <input 
                                    id="picker-upload" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleInlineUpload} 
                                    accept="image/*,.pdf,.doc,.docx"
                                    disabled={uploading}
                                />
                            </Label>
                        </DialogHeader>

                        {/* FILTERS ACCORDION */}
                        <div className="px-6 pb-2 border-b bg-muted/10">
                            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-full flex justify-between h-8 text-xs text-muted-foreground p-0 hover:bg-transparent">
                                        <span>Advanced Filters {(filters.search || filters.collection_name || filters.type !== 'all' || filters.date !== 'all') ? <span className="text-primary font-medium ml-1">(Active)</span> : ''}</span>
                                        {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-2 pb-3">
                                    <MediaFilters 
                                        filters={filters} 
                                        onChange={(f) => { setFilters(f); loadMedia(1, f, false); }} 
                                        compact 
                                    />
                                </CollapsibleContent>
                            </Collapsible>
                        </div>

                        {/* SCROLLABLE GRID AREA */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[400px]">
                            {loading ? (
                                <div className="text-sm text-muted-foreground flex justify-center items-center h-full">Loading media...</div>
                            ) : media.length === 0 ? (
                                <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-md text-center">
                                    No media found. Upload an image to get started.
                                </div>
                            ) : (
                                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                                    {media.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect({ id: item.id, path: item.path })}
                                            className="group relative rounded-md border cursor-pointer overflow-hidden hover:ring-4 hover:ring-primary/50 transition-all bg-muted/50 break-inside-avoid"
                                        >
                                            {item.mime_type.startsWith('image/') ? (
                                                <img
                                                    src={item.path}
                                                    alt={item.file_name}
                                                    className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <div className="w-full h-32 flex items-center justify-center text-xs p-2 text-center break-all">
                                                    {item.file_name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* INFINITE SCROLL TARGET */}
                            {(loading || page < lastPage) && media.length > 0 && (
                                <div ref={observerTarget} className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading more media...
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {value && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        onClick={() => {
                            onSelect('');
                            onSelectMedia?.(null);
                        }}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer h-7 px-2 justify-start w-max"
                    >
                        <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                )}
            </div>
        </div>
    );
}
