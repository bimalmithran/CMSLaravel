import { FileIcon, Trash2, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { apiFetch } from '../lib/api';

type MediaItem = {
    id: number;
    file_name: string;
    path: string;
    mime_type: string;
    size: number;
};

export function MediaPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    // useCallback ensures this function definition is stable across renders,
    // which satisfies the useEffect dependency linter.
    const loadMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch<MediaItem[]>('/api/v1/admin/media');
            if (res.success) {
                setMedia(res.data);
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
            // Note: If your custom apiFetch automatically stringifies JSON, 
            // you may need to ensure it skips that step when the body is FormData.
            const res = await apiFetch<MediaItem>('/api/v1/admin/media', {
                method: 'POST',
                body: formData, 
            });

            if (res.success) {
                void loadMedia(); // Refresh the grid after upload
            }
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
            
            if (res.success) {
                void loadMedia();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    }

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-lg font-semibold">Media Library</div>
                    <div className="text-sm text-muted-foreground">
                        Manage your images and files.
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {/* Label acts as the trigger for the hidden file input */}
                    <Label htmlFor="upload" className="cursor-pointer">
                        <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                            <Upload className="w-4 h-4" /> 
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
                <div className="text-sm text-muted-foreground">Loading media...</div>
            ) : media.length === 0 ? (
                <div className="text-sm text-muted-foreground border border-dashed p-8 text-center rounded-lg">
                    No files found. Upload your first image!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {media.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden border">
                            <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted/50">
                                {item.mime_type.startsWith('image/') ? (
                                    <img 
                                        src={item.path} 
                                        alt={item.file_name} 
                                        className="object-cover w-full h-full" 
                                    />
                                ) : (
                                    <FileIcon className="w-10 h-10 text-muted-foreground" />
                                )}
                                
                                {/* Hover overlay with delete button */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 cursor-pointer"
                                        onClick={() => void handleDelete(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                            <div className="p-2 text-[10px] truncate font-mono bg-background border-t">
                                {item.file_name}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}