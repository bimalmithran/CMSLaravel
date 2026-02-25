import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

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
}

export function MediaPicker({ value, onSelect }: MediaPickerProps) {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    function loadMedia(targetPage: number = 1) {
        setLoading(true);
        apiFetch<Paginated<MediaItem>>(`/api/v1/admin/media?page=${targetPage}`)
            .then((res) => {
                if (res.success) {
                    setMedia(res.data.data);
                    setPage(res.data.current_page);
                    setLastPage(res.data.last_page);
                }
            })
            .catch((err) => console.error('Failed to fetch media:', err))
            .finally(() => setLoading(false));
    }

    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);
        if (isOpen) {
            loadMedia(1); // Load first page when opened
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
                handleSelect(res.data.path);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    }

    function handleSelect(path: string) {
        onSelect(path);
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
                    
                    <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                            <DialogTitle>Select Media</DialogTitle>
                            
                            {/* INLINE UPLOAD BUTTON */}
                            <Label htmlFor="picker-upload" className="cursor-pointer m-0">
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

                        {/* SCROLLABLE GRID AREA */}
                        <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
                            {loading ? (
                                <div className="text-sm text-muted-foreground flex justify-center items-center h-full">Loading media...</div>
                            ) : media.length === 0 ? (
                                <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-md text-center">
                                    No media found. Upload an image to get started.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {media.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item.path)}
                                            className="group relative aspect-square rounded-md border cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all bg-muted/50"
                                        >
                                            {item.mime_type.startsWith('image/') ? (
                                                <img
                                                    src={item.path}
                                                    alt={item.file_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs p-2 text-center break-all">
                                                    {item.file_name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PAGINATION CONTROLS */}
                        {lastPage > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={page === 1 || loading}
                                    onClick={() => loadMedia(page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {lastPage}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={page === lastPage || loading}
                                    onClick={() => loadMedia(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {value && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button" 
                        onClick={() => onSelect('')}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 cursor-pointer h-7 px-2 justify-start w-max"
                    >
                        <X className="h-3 w-3 mr-1" /> Remove
                    </Button>
                )}
            </div>
        </div>
    );
}