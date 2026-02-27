import React from 'react';

interface HtmlContentPreviewProps {
    html: string;
    className?: string;
}

export function HtmlContentPreview({
    html,
    className = 'max-h-60',
}: HtmlContentPreviewProps) {
    return (
        <div
            className={`${className} overflow-y-auto rounded-md border p-3`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

