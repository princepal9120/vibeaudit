'use client';

import { useState, useRef, useEffect } from 'react';
import { MarkdownPreview } from './markdown-preview';
import { cn } from '@/lib/utils';

interface SplitViewProps {
    originalContent: string;
    securedContent: string;
}

export function SplitView({ originalContent, securedContent }: SplitViewProps) {
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const [syncScroll, setSyncScroll] = useState(true);

    // Synchronized scrolling
    useEffect(() => {
        if (!syncScroll) return;

        const handleLeftScroll = () => {
            if (leftPanelRef.current && rightPanelRef.current) {
                const scrollPercentage =
                    leftPanelRef.current.scrollTop /
                    (leftPanelRef.current.scrollHeight - leftPanelRef.current.clientHeight);
                rightPanelRef.current.scrollTop =
                    scrollPercentage * (rightPanelRef.current.scrollHeight - rightPanelRef.current.clientHeight);
            }
        };

        const handleRightScroll = () => {
            if (leftPanelRef.current && rightPanelRef.current) {
                const scrollPercentage =
                    rightPanelRef.current.scrollTop /
                    (rightPanelRef.current.scrollHeight - rightPanelRef.current.clientHeight);
                leftPanelRef.current.scrollTop =
                    scrollPercentage * (leftPanelRef.current.scrollHeight - leftPanelRef.current.clientHeight);
            }
        };

        const leftPanel = leftPanelRef.current;
        const rightPanel = rightPanelRef.current;

        leftPanel?.addEventListener('scroll', handleLeftScroll);
        rightPanel?.addEventListener('scroll', handleRightScroll);

        return () => {
            leftPanel?.removeEventListener('scroll', handleLeftScroll);
            rightPanel?.removeEventListener('scroll', handleRightScroll);
        };
    }, [syncScroll]);

    return (
        <div className="space-y-4">
            {/* Sync Toggle */}
            <div className="flex items-center justify-end">
                <button
                    onClick={() => setSyncScroll(!syncScroll)}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        syncScroll
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-muted text-muted-foreground border border-border'
                    )}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                    </svg>
                    {syncScroll ? 'Sync Enabled' : 'Sync Disabled'}
                </button>
            </div>

            {/* Split Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Panel */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-foreground">Original PRD</span>
                    </div>
                    <div
                        ref={leftPanelRef}
                        className="h-[600px] overflow-y-auto rounded-lg border border-border bg-background p-6 scroll-smooth"
                    >
                        <MarkdownPreview content={originalContent} />
                    </div>
                </div>

                {/* Secured Panel */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium text-emerald-900">Security-Enhanced PRD</span>
                    </div>
                    <div
                        ref={rightPanelRef}
                        className="h-[600px] overflow-y-auto rounded-lg border border-emerald-200 bg-emerald-50/30 p-6 scroll-smooth"
                    >
                        <MarkdownPreview content={securedContent} />
                    </div>
                </div>
            </div>
        </div>
    );
}
