import { FileIcon, Trash2, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { apiFetch } from '../../lib/api';
import type { MediaItem, PaginatedResponse } from '../../types/media';

export function MediaPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const loadMedia = useCallback(async (targetPage = 1) => {
        setLoading(true);
        try {
            const res = await apiFetch<PaginatedResponse<MediaItem>>(
                `/api/v1/admin/media?page=${targetPage}`,
            );
            if (res.success) {
                setMedia(res.data.data);
                setPage(res.data.current_page);
                setLastPage(res.data.last_page);
            }
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMedia();
    }, [loadMedia]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            const res = await apiFetch<MediaItem>('/api/v1/admin/media', {
                method: 'POST',
                body: formData,
            });
            if (res.success) void loadMedia();
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            const res = await apiFetch<unknown>(`/api/v1/admin/media/${id}`, {
                method: 'DELETE',
            });
            if (res.success) void loadMedia();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }

    return (
        <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Media Library</div>
                    <div className="text-sm text-muted-foreground">
                        Manage your images and files.
                    </div>
                </div>

                <div className="flex gap-2">
                    <Label htmlFor="upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            <Upload className="h-4 w-4" />
                            Upload File
                        </div>
                        <input
                            id="upload"
                            type="file"
                            className="hidden"
                            onChange={handleUpload}
                            accept="image/*,.pdf,.doc,.docx"
                        />
                    </Label>
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">
                    Loading media...
                </div>
            ) : media.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No files found. Upload your first image!
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {media.map((item) => (
                        <Card
                            key={item.id}
                            className="group relative overflow-hidden border"
                        >
                            <CardContent className="flex aspect-square items-center justify-center bg-muted/50 p-0">
                                {item.mime_type.startsWith('image/') ? (
                                    <img
                                        src={item.path}
                                        alt={item.file_name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 cursor-pointer"
                                        onClick={() =>
                                            void handleDelete(item.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                            <div className="truncate border-t bg-background p-2 font-mono text-[10px]">
                                {item.file_name}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            {lastPage > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={page === 1 || loading}
                        onClick={() => void loadMedia(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {lastPage}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === lastPage || loading}
                        onClick={() => void loadMedia(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
