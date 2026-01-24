'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PrdFinding {
  id: string;
  framework: string;
  frameworkItem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  recommendation: string;
  section?: string;
}

interface FrameworkCoverage {
  framework: string;
  frameworkName: string;
  coveredItems: string[];
  missingItems: string[];
  coveragePercent: number;
}

interface PrdReview {
  id: string;
  title: string;
  fileName: string | null;
  securityScore: number | null;
  securedContent: string | null;
  findings: PrdFinding[] | null;
  frameworkCoverage: FrameworkCoverage[] | null;
  processingTimeMs: number | null;
  createdAt: string;
  completedAt: string | null;
  authorName: string;
}

function getSeverityBadge(severity: string) {
  const config: Record<string, { className: string }> = {
    CRITICAL: { className: 'bg-red-100 text-red-700 border border-red-200' },
    HIGH: { className: 'bg-amber-100 text-amber-700 border border-amber-200' },
    MEDIUM: { className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    LOW: { className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  };

  const { className } = config[severity] || { className: 'bg-slate-100 text-slate-700' };
  return <Badge className={className}>{severity}</Badge>;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Critical';
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ChevronIcon({ className, direction = 'down' }: { className?: string; direction?: 'up' | 'down' }) {
  return (
    <svg
      className={`${className} transition-transform ${direction === 'up' ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function SharedPrdReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [review, setReview] = useState<PrdReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(`${API_URL}/api/prd-reviews/shared/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Review not found or link has expired');
          }
          throw new Error('Failed to fetch review');
        }

        const data = await response.json();
        setReview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading review...
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="border-red-200 bg-red-50 max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Review Not Found</h3>
            <p className="text-slate-600 mb-4">{error || 'This review link may have expired or is invalid.'}</p>
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Go to VibeAudit
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const findings = review.findings || [];
  const frameworks = review.frameworkCoverage || [];
  const score = review.securityScore || 0;

  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldIcon className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-slate-900">VibeAudit</span>
          </Link>
          <Badge className="bg-slate-100 text-slate-600">Shared PRD Review</Badge>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">PRD Security Review</h1>
          <p className="text-lg text-slate-700 mb-1">{review.title}</p>
          <p className="text-slate-500">
            {review.fileName && `${review.fileName} - `}
            Generated {new Date(review.createdAt).toLocaleDateString()}
            {review.authorName && ` by ${review.authorName}`}
          </p>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`border md:col-span-1 ${getScoreBg(score)}`}>
            <CardContent className="py-6 text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-slate-500 mt-2">Security Score</div>
              <div className={`text-sm font-medium mt-1 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-900">Findings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-red-50">
                  <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                  <div className="text-sm text-slate-500">Critical</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50">
                  <div className="text-3xl font-bold text-amber-600">{highCount}</div>
                  <div className="text-sm text-slate-500">High</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <div className="text-3xl font-bold text-yellow-600">{mediumCount}</div>
                  <div className="text-sm text-slate-500">Medium</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="text-3xl font-bold text-blue-600">{lowCount}</div>
                  <div className="text-sm text-slate-500">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Framework Coverage */}
        {frameworks.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Framework Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.map((fw) => (
                  <div key={fw.framework}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{fw.frameworkName}</span>
                      <span className={`text-sm font-medium ${
                        fw.coveragePercent >= 75 ? 'text-emerald-600' :
                        fw.coveragePercent >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {fw.coveragePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          fw.coveragePercent >= 75 ? 'bg-emerald-500' :
                          fw.coveragePercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${fw.coveragePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Findings List */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Security Findings ({findings.length})
          </h2>
          {findings.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Security Issues Found</h3>
                <p className="text-slate-500">Great job! This PRD addresses all security requirements.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <Card key={finding.id} className="border-slate-200">
                  <CardContent className="py-4">
                    <button
                      onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(finding.severity)}
                          <span className="font-medium text-slate-900">{finding.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{finding.framework}</span>
                          <ChevronIcon className="h-4 w-4" direction={expandedFinding === finding.id ? 'up' : 'down'} />
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {finding.frameworkItem}
                      </div>
                    </button>

                    {expandedFinding === finding.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Issue</h4>
                          <p className="text-slate-700">{finding.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 mb-1">Recommendation</h4>
                          <p className="text-slate-700 whitespace-pre-wrap">{finding.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-6 text-center">
            <ShieldIcon className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Want to review your own PRD?
            </h3>
            <p className="text-slate-600 mb-4">
              Get security insights for your product requirements with VibeAudit
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-2">
            <ShieldIcon className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-slate-500">
              Powered by <span className="font-medium text-slate-900">VibeAudit</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
