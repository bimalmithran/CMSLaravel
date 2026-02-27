import { FileIcon, Search, Trash2, Upload, CheckSquare, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { apiFetch } from '../../lib/api';
import type { MediaItem, PaginatedResponse } from '../../types/media';
import { MediaDetailsDialog } from './components/MediaDetailsDialog';

export function MediaPage() {
    // Data & Pagination State
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');

    // Action State
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Bulk Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const loadMedia = useCallback(
        async (targetPage = 1, searchQuery = search) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(targetPage),
                });
                if (searchQuery) params.append('search', searchQuery);

                const res = await apiFetch<PaginatedResponse<MediaItem>>(
                    `/api/v1/admin/media?${params.toString()}`,
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
        },
        [search],
    );

    useEffect(() => {
        void loadMedia();
    }, [loadMedia]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        void loadMedia(1, search);
    };

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await apiFetch<any>('/api/v1/admin/media', {
                method: 'POST',
                body: formData,
            });

            if (!res.success) {
                if (res.errors) {
                    const detailedErrors = Object.values(res.errors).flat();
                    throw new Error(detailedErrors.join('\n'));
                }
                throw new Error(res.message || 'Upload failed');
            }

            await loadMedia(1);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(
                error instanceof Error
                    ? error.message
                    : 'An error occurred during upload.',
            );
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    }

    async function updateMediaDetails(
        id: number,
        data: { file_name: string; alt_text: string },
    ) {
        setIsUpdating(true);
        try {
            const res = await apiFetch<{ success: boolean; message?: string }>(
                `/api/v1/admin/media/${id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                },
            );

            if (!res.success) throw new Error(res.message || 'Update failed');
            await loadMedia(page);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setIsUpdating(false);
        }
    }

    async function deleteMedia(item: MediaItem) {
        if (
            !confirm(
                `Are you sure you want to permanently delete "${item.file_name}"?`,
            )
        )
            return;

        setIsDeleting(true);
        try {
            const res = await apiFetch<unknown>(
                `/api/v1/admin/media/${item.id}`,
                {
                    method: 'DELETE',
                },
            );

            if (res.success) {
                setSelectedMedia(null);
                void loadMedia(page);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete media.');
        } finally {
            setIsDeleting(false);
        }
    }

    // New Bulk Delete Handler
    async function handleBulkDelete() {
        if (selectedIds.length === 0) return;
        if (
            !confirm(
                `Are you sure you want to permanently delete ${selectedIds.length} files?`,
            )
        )
            return;

        setIsDeleting(true);
        try {
            const res = await apiFetch<{ success: boolean; message?: string }>(
                '/api/v1/admin/media/bulk-delete',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedIds }),
                },
            );

            if (!res.success)
                throw new Error(res.message || 'Bulk delete failed');

            // Reset selection state and reload
            setSelectedIds([]);
            setIsSelectionMode(false);
            void loadMedia(page);
        } catch (err) {
            console.error('Bulk delete failed:', err);
            alert(
                err instanceof Error
                    ? err.message
                    : 'Failed to delete selected media.',
            );
        } finally {
            setIsDeleting(false);
        }
    }

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Media Library
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your store's images and files.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Dynamic Header Controls based on Selection Mode */}
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-1">
                            <span className="px-3 text-sm font-medium">
                                {selectedIds.length} selected
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={selectedIds.length === 0}
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds([]);
                                }}
                            >
                                <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                        </div>
                    ) : (
                        <>
                            <form
                                onSubmit={handleSearch}
                                className="relative w-full sm:w-64"
                            >
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search files..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>

                            <Button
                                variant="outline"
                                onClick={() => setIsSelectionMode(true)}
                                className="shrink-0"
                            >
                                <CheckSquare className="mr-2 h-4 w-4" /> Select
                            </Button>

                            <Label
                                htmlFor="upload"
                                className="shrink-0 cursor-pointer"
                            >
                                <div className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                                    <Upload className="h-4 w-4" /> Upload
                                </div>
                                <input
                                    id="upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleUpload}
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                            </Label>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    Loading media...
                </div>
            ) : media.length === 0 ? (
                <div className="rounded-lg border border-dashed py-24 text-center">
                    <p className="text-sm text-muted-foreground">
                        No files found.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Upload your first image to get started!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {media.map((item) => {
                        const isSelected = selectedIds.includes(item.id);

                        return (
                            <Card
                                key={item.id}
                                className={`group relative cursor-pointer overflow-hidden transition-all ${
                                    isSelected
                                        ? 'border-transparent ring-2 ring-primary'
                                        : 'border hover:border-primary/50'
                                }`}
                                onClick={() => {
                                    if (isSelectionMode) {
                                        toggleSelection(item.id);
                                    } else {
                                        setSelectedMedia(item);
                                    }
                                }}
                            >
                                <CardContent className="flex aspect-square items-center justify-center bg-muted/30 p-0">
                                    {item.mime_type.startsWith('image/') ? (
                                        <img
                                            src={item.path}
                                            alt={
                                                item.alt_text || item.file_name
                                            }
                                            className="h-full w-full object-contain p-1"
                                        />
                                    ) : (
                                        <FileIcon className="h-10 w-10 text-muted-foreground" />
                                    )}

                                    {/* Selection Checkbox (Visible in Selection Mode) */}
                                    {isSelectionMode && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox
                                                checked={isSelected}
                                                // Prevent double-firing the onClick event from the parent card
                                                onCheckedChange={() =>
                                                    toggleSelection(item.id)
                                                }
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Quick Delete Overlay (Hidden in Selection Mode) */}
                                    {!isSelectionMode && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 scale-90 transition-transform group-hover:scale-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    void deleteMedia(item);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="truncate border-t bg-background p-2 font-mono text-[10px] text-muted-foreground">
                                    {item.file_name}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {lastPage > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1 || loading}
                        onClick={() => void loadMedia(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
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

            <MediaDetailsDialog
                media={selectedMedia}
                open={!!selectedMedia}
                onOpenChange={(open) => !open && setSelectedMedia(null)}
                onUpdate={updateMediaDetails}
                onDelete={deleteMedia}
            />

            <FullScreenLoader
                open={isUploading}
                text="Uploading and compressing image..."
            />
            <FullScreenLoader open={isUpdating} text="Saving changes..." />
            <FullScreenLoader open={isDeleting} text="Deleting files..." />
        </div>
    );
}
