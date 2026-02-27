import { Loader2 } from 'lucide-react';
import React from 'react';

interface FullScreenLoaderProps {
    open: boolean;
    text?: string;
}

export function FullScreenLoader({
    open,
    text = 'Loading...',
}: FullScreenLoaderProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-lg border bg-background px-5 py-3 shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">{text}</span>
            </div>
        </div>
    );
}
