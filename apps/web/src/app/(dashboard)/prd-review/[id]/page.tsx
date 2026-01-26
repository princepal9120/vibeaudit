'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2, AlertCircle, RefreshCw, Share2, Link2, Check, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { api, type PrdReviewDetail } from '@/lib/api';
import { PrdDiffViewer, PrdFindingsPanel, MarkdownPreview, SplitView } from '@/components/prd-review';
import { SecurityScoreGauge } from '@/components/ui/security-score-gauge';
import { cn, formatDate } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-500/10 text-gray-500' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
  FAILED: { label: 'Failed', color: 'bg-red-500/10 text-red-500' },
};

export default function PrdReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id as string;

  const [review, setReview] = useState<PrdReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'secured' | 'split' | 'diff'>('split');

  const fetchReview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPrdReview(reviewId);
      setReview(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load review';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Auto-refresh for processing reviews
  useEffect(() => {
    if (!review || (review.status !== 'PROCESSING' && review.status !== 'PENDING')) return;

    const interval = setInterval(fetchReview, 3000);
    return () => clearInterval(interval);
  }, [review, fetchReview]);

  const handleDownloadMarkdown = async () => {
    const url = api.getPrdReviewDownloadUrl(reviewId);

    try {
      const blob = await api.fetchWithAuth(url);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${review?.title || 'prd'}_secured.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download markdown:', err);
      toast.error('Failed to download markdown');
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfLoading) return;

    setPdfLoading(true);
    try {
      // Upload and get the PDF URL (or get cached version)
      const result = await api.uploadPrdReviewPdf(reviewId);
      // Open the PDF URL in a new tab
      window.open(result.url, '_blank');
    } catch (err) {
      // Fallback to on-the-fly PDF generation
      try {
        const url = api.getPrdReviewPdfUrl(reviewId);
        const blob = await api.fetchWithAuth(url);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${review?.title || 'prd'}_security_review.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (downloadErr) {
        console.error('Failed to download PDF:', downloadErr);
        toast.error('Failed to download PDF');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    if (shareLoading) return;

    setShareLoading(true);
    try {
      const result = await api.sharePrdReview(reviewId);
      const fullUrl = `${window.location.origin}${result.shareUrl}`;
      setShareUrl(fullUrl);
      setShowShareMenu(true);
      // Update review state with new share info
      if (review) {
        setReview({
          ...review,
          shareToken: result.shareToken,
          shareExpiresAt: result.expiresAt,
        });
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
      toast.error('Failed to create share link');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleRevokeShare = async () => {
    try {
      await api.revokePrdReviewShare(reviewId);
      setShareUrl(null);
      setShowShareMenu(false);
      if (review) {
        setReview({
          ...review,
          shareToken: null,
          shareExpiresAt: null,
        });
      }
    } catch (err) {
      console.error('Failed to revoke share:', err);
      toast.error('Failed to revoke share link');
    }
  };

  // Initialize share URL if review already has a share token
  useEffect(() => {
    if (review?.shareToken) {
      setShareUrl(`${window.location.origin}/prd-review/shared/${review.shareToken}`);
    }
  }, [review?.shareToken]);

  if (loading && !review) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          href="/prd-review"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PRD Reviews
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchReview()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const isProcessing = review.status === 'PROCESSING' || review.status === 'PENDING';
  const isCompleted = review.status === 'COMPLETED';
  const status = statusConfig[review.status];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Back Link */}
      <Link
        href="/prd-review"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to PRD Reviews
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">{review.title}</h1>
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', status.color)}>
              {isProcessing && <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />}
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {review.fileName && <span>{review.fileName}</span>}
            <span>{formatDate(review.createdAt)}</span>
            {review.processingTimeMs && (
              <span>Analyzed in {(review.processingTimeMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => fetchReview()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Share button */}
            <div className="relative">
              <button
                onClick={() => (review?.shareToken ? setShowShareMenu(!showShareMenu) : handleShare())}
                disabled={shareLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {shareLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{review?.shareToken ? 'Shared' : 'Share'}</span>
              </button>

              {/* Share menu dropdown */}
              {showShareMenu && shareUrl && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card rounded-lg border border-border shadow-lg p-4 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Share Link</span>
                    <button onClick={() => setShowShareMenu(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-xs bg-muted rounded px-2 py-1.5 text-muted-foreground truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {review?.shareExpiresAt && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Expires: {formatDate(review.shareExpiresAt)}
                    </p>
                  )}
                  <button
                    onClick={handleRevokeShare}
                    className="w-full text-xs text-destructive hover:text-destructive/80 py-1"
                  >
                    Revoke share link
                  </button>
                </div>
              )}
            </div>

            {/* Download PDF button */}
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Download Markdown button */}
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Secured PRD</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-card border border-border">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Analyzing your PRD</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            We&apos;re analyzing your PRD against multiple security frameworks. This usually takes about 30-60
            seconds.
          </p>
        </div>
      )}

      {/* Failed State */}
      {review.status === 'FAILED' && (
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">Analysis Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {review.errorMessage || 'An error occurred while analyzing your PRD. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completed State */}
      {isCompleted && review.securedContent && (
        <>
          {/* Score and Findings Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Security Score */}
            <div className="lg:col-span-1 p-6 rounded-xl bg-card border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Security Score</h3>
              <div className="flex justify-center">
                <SecurityScoreGauge score={review.securityScore || 0} size="lg" />
              </div>
            </div>

            {/* Findings Panel */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border overflow-hidden">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Security Analysis</h3>
              <div className="max-h-[400px] overflow-y-auto">
                <PrdFindingsPanel
                  findings={review.findings || []}
                  frameworkCoverage={review.frameworkCoverage || []}
                />
              </div>
            </div>
          </div>

          {/* Tabbed PRD Viewer */}
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border w-fit">
              <button
                onClick={() => setActiveTab('split')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'split'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'original'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Original
              </button>
              <button
                onClick={() => setActiveTab('secured')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'secured'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Secured
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === 'diff'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Diff
              </button>
            </div>

            {/* Tab Content */}
            <div className="rounded-xl border border-border bg-background overflow-hidden">
              {activeTab === 'split' && (
                <div className="p-6">
                  <SplitView
                    originalContent={review.originalContent}
                    securedContent={review.securedContent}
                  />
                </div>
              )}

              {activeTab === 'original' && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-900">Original PRD</span>
                  </div>
                  <div className="max-h-[800px] overflow-y-auto">
                    <MarkdownPreview content={review.originalContent} />
                  </div>
                </div>
              )}

              {activeTab === 'secured' && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-900">Security-Enhanced PRD</span>
                  </div>
                  <div className="max-h-[800px] overflow-y-auto">
                    <MarkdownPreview content={review.securedContent} />
                  </div>
                </div>
              )}

              {activeTab === 'diff' && (
                <div className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">PRD Comparison (Diff View)</h3>
                  <PrdDiffViewer originalContent={review.originalContent} securedContent={review.securedContent} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
