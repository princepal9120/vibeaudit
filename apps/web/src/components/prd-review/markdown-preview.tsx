'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            toast.success('Markdown copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy markdown');
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-all"
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                    </>
                )}
            </button>

            {/* Markdown Content */}
            <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r prose-ul:list-disc prose-ol:list-decimal prose-li:text-foreground prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
}
