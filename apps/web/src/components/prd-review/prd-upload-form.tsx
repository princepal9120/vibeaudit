'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrdUploadFormProps {
  onSubmit: (data: { title: string; content: string; fileName?: string }) => Promise<void>;
  disabled?: boolean;
  error?: string;
}

export function PrdUploadForm({ onSubmit, disabled, error }: PrdUploadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback((file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt') && !file.name.endsWith('.markdown')) {
      setLocalError('Please upload a markdown (.md) or text (.txt) file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
      setFileName(file.name);
      setLocalError(null);

      // Auto-generate title from filename if not set
      if (!title) {
        const baseName = file.name.replace(/\.(md|txt|markdown)$/, '');
        setTitle(baseName);
      }
    };
    reader.onerror = () => {
      setLocalError('Failed to read file');
    };
    reader.readAsText(file);
  }, [title]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleClearFile = useCallback(() => {
    setContent('');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setLocalError('Please enter a title for your PRD');
      return;
    }

    if (!content.trim()) {
      setLocalError('Please provide PRD content');
      return;
    }

    if (content.length < 100) {
      setLocalError('PRD content must be at least 100 characters');
      return;
    }

    setLocalError(null);
    setLoading(true);
    const toastId = toast.loading('Initiating architectural review...');

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        fileName: fileName || undefined,
      });
      toast.success('PRD submitted for analysis', { id: toastId });
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit PRD';
      setLocalError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [title, content, fileName, onSubmit]);

  const displayError = localError || error;

  return (
    <div className="space-y-5">
      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">PRD Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., My SaaS App PRD"
          disabled={disabled || loading}
          className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* File Upload / Paste Area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">PRD Content</label>

        {!content ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-input bg-card',
              (disabled || loading) && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && !loading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || loading}
            />

            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">
              Drop your PRD file here or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .md, .txt, and .markdown files
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-between mb-2 px-1">
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{fileName}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleClearFile}
                disabled={disabled || loading}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={disabled || loading}
              rows={12}
              placeholder="Or paste your PRD content here..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono disabled:opacity-50"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {content.length.toLocaleString()} characters
            </div>
          </div>
        )}

        {!content && (
          <div className="text-center py-3">
            <span className="text-sm text-muted-foreground">or</span>
          </div>
        )}

        {!content && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled || loading}
            rows={8}
            placeholder="Paste your PRD content here..."
            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono disabled:opacity-50"
          />
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || loading || !title.trim() || !content.trim()}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing PRD...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Analyze PRD</span>
          </>
        )}
      </button>
    </div>
  );
}
