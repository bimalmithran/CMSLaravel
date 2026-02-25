import { Image as ImageIcon, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../../components/ui/dialog';
import { apiFetch } from '../lib/api';

type MediaItem = {
    id: number;
    file_name: string;
    path: string;
    mime_type: string;
};

interface MediaPickerProps {
    value?: string | null;
    onSelect: (url: string) => void;
}

export function MediaPicker({ value, onSelect }: MediaPickerProps) {
    const [open, setOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch data exactly when the dialog is instructed to open,
    // avoiding the useEffect cascading render entirely.
    function handleOpenChange(isOpen: boolean) {
        setOpen(isOpen);

        if (isOpen) {
            setLoading(true);
            apiFetch<MediaItem[]>('/api/v1/admin/media')
                .then((res) => {
                    if (res.success) setMedia(res.data);
                })
                .catch((err) => console.error('Failed to fetch media:', err))
                .finally(() => setLoading(false));
        }
    }

    function handleSelect(path: string) {
        onSelect(path);
        setOpen(false); // Close modal after selection
    }

    return (
        <div className="flex items-center gap-4">
            {/* Preview Thumbnail */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {value ? (
                    <img
                        src={value}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
            </div>

            <div className="flex flex-col gap-2">
                {/* Bind our new handler to onOpenChange */}
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            type="button"
                            className="cursor-pointer"
                        >
                            Browse Media
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Select Media</DialogTitle>
                        </DialogHeader>

                        {loading ? (
                            <div className="p-4 text-sm text-muted-foreground">
                                Loading media...
                            </div>
                        ) : media.length === 0 ? (
                            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                No media found. Go to the Media Library to
                                upload some files.
                            </div>
                        ) : (
                            <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-5">
                                {media.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item.path)}
                                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-primary"
                                    >
                                        {item.mime_type.startsWith('image/') ? (
                                            <img
                                                src={item.path}
                                                alt={item.file_name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted p-2 text-center text-xs break-all">
                                                {item.file_name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Clear Button */}
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => onSelect('')}
                        className="h-7 cursor-pointer justify-start px-2 text-destructive hover:bg-destructive/10 hover:text-destructive/90"
                    >
                        <X className="mr-1 h-3 w-3" /> Remove Image
                    </Button>
                )}
            </div>
        </div>
    );
}
