import React, { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { RichTextEditor } from './ui/RichTextEditor';

interface WysiwygHtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    visualPlaceholder?: string;
    sourcePlaceholder?: string;
    sourceRows?: number;
    sourceHint?: string;
}

export function WysiwygHtmlEditor({
    value,
    onChange,
    visualPlaceholder = 'Write content...',
    sourcePlaceholder = '<section><h1>Title</h1><p>...</p></section>',
    sourceRows = 14,
    sourceHint = 'Stored as raw HTML for flexible storefront rendering.',
}: WysiwygHtmlEditorProps) {
    const [mode, setMode] = useState<'visual' | 'html'>('visual');

    return (
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'visual' | 'html')} className="w-full">
            <TabsList className="mb-2">
                <TabsTrigger value="visual" className="cursor-pointer">
                    Visual Editor
                </TabsTrigger>
                <TabsTrigger value="html" className="cursor-pointer">
                    HTML Source
                </TabsTrigger>
            </TabsList>

            <TabsContent value="visual">
                <RichTextEditor value={value} onChange={onChange} placeholder={visualPlaceholder} />
            </TabsContent>

            <TabsContent value="html" className="space-y-2">
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={sourceRows}
                    className="font-mono text-xs"
                    placeholder={sourcePlaceholder}
                />
                <p className="text-xs text-muted-foreground">{sourceHint}</p>
            </TabsContent>
        </Tabs>
    );
}

