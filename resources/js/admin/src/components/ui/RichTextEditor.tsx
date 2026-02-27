import {
    Bold,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline,
    Unlink,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { Button } from '../../../../components/ui/button';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write content...',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    function exec(command: string, commandValue?: string) {
        document.execCommand(command, false, commandValue);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            editorRef.current.focus();
        }
    }

    return (
        <div className="rounded-md border">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('bold')}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('italic')}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('underline')}>
                    <Underline className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('formatBlock', 'h2')}>
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('insertUnorderedList')}>
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('insertOrderedList')}>
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const link = window.prompt('Enter URL');
                        if (link) exec('createLink', link);
                    }}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => exec('unlink')}>
                    <Unlink className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[260px] p-3 text-sm outline-none"
                data-placeholder={placeholder}
                onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
            />
        </div>
    );
}

