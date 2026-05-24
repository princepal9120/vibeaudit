'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, FileText, Trash2, Loader2 } from 'lucide-react';
import { api, type PrdReview } from '@/lib/api';
import { UsageMeter } from '@/components/prd-review';
import { cn, formatDate } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-gray-500/10 text-gray-500' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
  FAILED: { label: 'Failed', color: 'bg-red-500/10 text-red-500' },
};

export default function PrdReviewPage() {
  const [reviews, setReviews] = useState<PrdReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    reviewsUsed: number;
    reviewsLimit: number;
    isUnlimited: boolean;
    periodEnd: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsRes, subscriptionRes] = await Promise.all([
        api.getPrdReviews(),
        api.getCurrentSubscription(),
      ]);
      setReviews(reviewsRes.reviews);
      setUsage(subscriptionRes.usage);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh for processing reviews
  useEffect(() => {
    const hasProcessing = reviews.some((r) => r.status === 'PROCESSING' || r.status === 'PENDING');
    if (!hasProcessing) return;

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [reviews, fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(id);
    try {
      await api.deletePrdReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">PRD Security Review</h1>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Analyze your PRDs for security gaps and get AI-enhanced recommendations
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/prd-review/new"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Review</span>
          </Link>
        </div>
      </div>

      {/* Usage Meter */}
      {usage && (
        <div className="p-4 rounded-xl bg-card border border-border">
          <UsageMeter
            reviewsUsed={usage.reviewsUsed}
            reviewsLimit={usage.reviewsLimit}
            isUnlimited={usage.isUnlimited}
            periodEnd={usage.periodEnd}
          />
        </div>
      )}

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
              <div className="h-5 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-border mt-8 p-8 sm:p-16 text-center border-dashed">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No PRD reviews yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
            Upload your first PRD to analyze it for security gaps and get AI-enhanced recommendations.
          </p>
          <Link
            href="/prd-review/new"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground text-sm sm:text-base font-medium hover:opacity-90 transition-opacity"
          >
            Analyze Your First PRD
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const status = statusConfig[review.status];
            const isProcessing = review.status === 'PROCESSING' || review.status === 'PENDING';

            return (
              <div
                key={review.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-input transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/prd-review/${review.id}`}
                        className="text-foreground font-medium hover:text-primary transition-colors truncate"
                      >
                        {review.title}
                      </Link>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', status.color)}>
                        {isProcessing && <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />}
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      {review.fileName && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {review.fileName}
                        </span>
                      )}
                      <span>{formatDate(review.createdAt)}</span>
                      {review.securityScore !== null && (
                        <span
                          className={cn(
                            'font-medium',
                            review.securityScore >= 80
                              ? 'text-green-500'
                              : review.securityScore >= 50
                                ? 'text-yellow-500'
                                : 'text-red-500'
                          )}
                        >
                          Score: {review.securityScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === 'COMPLETED' && (
                      <Link
                        href={`/prd-review/${review.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        View Results
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === review.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
