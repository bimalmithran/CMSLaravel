import { Copy, ExternalLink, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { CrudDialog } from '../../../components/CrudDialog';
import type { MediaItem } from '../../../types/media';

interface MediaDetailsDialogProps {
    media: MediaItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (id: number, data: { file_name: string; alt_text: string }) => Promise<void>;
    onDelete: (media: MediaItem) => Promise<void>;
}

export function MediaDetailsDialog({ media, open, onOpenChange, onUpdate, onDelete }: MediaDetailsDialogProps) {
    const [fileName, setFileName] = useState('');
    const [altText, setAltText] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && media) {
            setFileName(media.file_name || '');
            setAltText(media.alt_text || '');
        }
    }, [open, media]);

    if (!media) return null;

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.origin + media.path);
        alert('URL copied to clipboard!'); 
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate(media.id, { file_name: fileName, alt_text: altText });
            onOpenChange(false);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        await onDelete(media);
    };

    return (
        <CrudDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Attachment Details"
            size="lg"
        >
            <div className="flex flex-col">
                {/* Scrollable Content Area */}
                <div className="grid max-h-[65vh] grid-cols-1 gap-6 overflow-y-auto p-1 md:grid-cols-2">
                    
                    {/* LEFT COLUMN: Image Preview */}
                    <div className="flex flex-col space-y-3 rounded-md border bg-muted/30 p-4">
                        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-transparent">
                            <img
                                src={media.path}
                                alt={media.alt_text || media.file_name}
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p><span className="font-semibold text-foreground">Uploaded on:</span> {new Date(media.created_at).toLocaleDateString()}</p>
                            <p><span className="font-semibold text-foreground">File size:</span> {formatBytes(media.size)}</p>
                            <p><span className="font-semibold text-foreground">File type:</span> {media.mime_type}</p>
                        </div>

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button variant="secondary" size="sm" className="w-full sm:flex-1" onClick={handleCopyUrl}>
                                <Copy className="mr-2 h-4 w-4" /> Copy URL
                            </Button>
                            <Button variant="secondary" size="sm" className="w-full sm:flex-1" asChild>
                                <a href={media.path} target="_blank" rel="noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> View Full
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Edit Form */}
                    <div className="flex flex-col space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="file_name">File Name</Label>
                            <Input
                                id="file_name"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="my-image.jpg"
                            />
                            <p className="text-[10px] text-muted-foreground">This is used internally to identify the file.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alt_text">Alternative Text (SEO)</Label>
                            <Input
                                id="alt_text"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Describe the image for screen readers..."
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Alt text is crucial for accessibility and SEO. Describe the purpose of the image.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Now outside the grid to ensure they always stay visible and full-width */}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="destructive" onClick={handleDelete} type="button" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                    </Button>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </CrudDialog>
    );
}