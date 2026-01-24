'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Shield, ArrowLeftRight, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface PrdDiffViewerProps {
  originalContent: string;
  securedContent: string;
}

type ViewMode = 'split' | 'original' | 'secured';

export function PrdDiffViewer({ originalContent, securedContent }: PrdDiffViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [syncScroll, setSyncScroll] = useState(true);

  // Synchronized scrolling
  useEffect(() => {
    if (!syncScroll || viewMode !== 'split') return;

    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    if (!leftEl || !rightEl) return;

    let isLeftScrolling = false;
    let isRightScrolling = false;

    const handleLeftScroll = () => {
      if (isRightScrolling) return;
      isLeftScrolling = true;
      const scrollPercent = leftEl.scrollTop / (leftEl.scrollHeight - leftEl.clientHeight);
      rightEl.scrollTop = scrollPercent * (rightEl.scrollHeight - rightEl.clientHeight);
      requestAnimationFrame(() => {
        isLeftScrolling = false;
      });
    };

    const handleRightScroll = () => {
      if (isLeftScrolling) return;
      isRightScrolling = true;
      const scrollPercent = rightEl.scrollTop / (rightEl.scrollHeight - rightEl.clientHeight);
      leftEl.scrollTop = scrollPercent * (leftEl.scrollHeight - leftEl.clientHeight);
      requestAnimationFrame(() => {
        isRightScrolling = false;
      });
    };

    leftEl.addEventListener('scroll', handleLeftScroll);
    rightEl.addEventListener('scroll', handleRightScroll);

    return () => {
      leftEl.removeEventListener('scroll', handleLeftScroll);
      rightEl.removeEventListener('scroll', handleRightScroll);
    };
  }, [syncScroll, viewMode]);

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'split' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Split
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'original' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Original
          </button>
          <button
            onClick={() => setViewMode('secured')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'secured' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            Secured
          </button>
        </div>

        {viewMode === 'split' && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="rounded border-border"
            />
            Sync scroll
          </label>
        )}
      </div>

      {/* Content Panels */}
      <div
        className={cn('gap-4', viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2' : 'block')}
      >
        {/* Original Panel */}
        {(viewMode === 'split' || viewMode === 'original') && (
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-t-lg">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Original PRD</span>
            </div>
            <div
              ref={leftRef}
              className="flex-1 overflow-auto p-4 bg-card border-x border-b border-border rounded-b-lg prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-secondary prose-code:px-1 prose-code:rounded"
            >
              <ReactMarkdown>{originalContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Secured Panel */}
        {(viewMode === 'split' || viewMode === 'secured') && (
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-t-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Secured PRD</span>
              <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Enhanced</span>
            </div>
            <div
              ref={rightRef}
              className="flex-1 overflow-auto p-4 bg-card border-x border-b border-border rounded-b-lg prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-secondary prose-code:px-1 prose-code:rounded"
            >
              <ReactMarkdown>{securedContent}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
