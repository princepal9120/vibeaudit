'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Finding {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: string;
  description: string;
  impact: string;
  remediation: string;
  filePath: string | null;
  lineNumber: number | null;
  codeSnippet: string | null;
  confidence: number;
}

interface Report {
  id: string;
  securityScore: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  executiveSummary: string | null;
  shareToken: string | null;
  createdAt: string;
  findings: Finding[];
  scan: {
    id: string;
    githubRepoUrl: string | null;
    liveUrl: string | null;
    createdAt: string;
    completedAt: string | null;
  };
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

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
        if (data.shareToken) {
          setShareUrl(`${window.location.origin}/reports/shared/${data.shareToken}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/share`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const url = `${window.location.origin}/reports/shared/${data.shareToken}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
      }
    } catch (err) {
      console.error('Failed to share report:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}/pdf`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ShipSafe-report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading report...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error || 'Report not found'}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="border-border">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const target = report.scan.githubRepoUrl || report.scan.liveUrl || 'Unknown';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Security Report</h1>
          </div>
          <p className="text-muted-foreground">
            {target} - Generated {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={sharing}
            className="border-border"
          >
            {sharing ? 'Sharing...' : shareUrl ? 'Copy Link' : 'Share Report'}
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-border"
          >
            Back
          </Button>
        </div>
      </div>

      {shareUrl && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-emerald-700">Share link copied to clipboard!</p>
                <p className="text-xs text-emerald-600 font-mono truncate">{shareUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border md:col-span-1 ${getScoreBg(report.securityScore)}`}>
          <CardContent className="py-6 text-center">
            <div className={`text-6xl font-bold ${getScoreColor(report.securityScore)}`}>
              {report.securityScore}
            </div>
            <div className="text-muted-foreground mt-2">Security Score</div>
            <div className={`text-sm font-medium mt-1 ${getScoreColor(report.securityScore)}`}>
              {getScoreLabel(report.securityScore)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Findings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-red-500/10">
                <div className="text-3xl font-bold text-red-600">{report.criticalCount}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <div className="text-3xl font-bold text-amber-600">{report.highCount}</div>
                <div className="text-sm text-muted-foreground">High</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <div className="text-3xl font-bold text-yellow-600">{report.mediumCount}</div>
                <div className="text-sm text-muted-foreground">Medium</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <div className="text-3xl font-bold text-blue-600">{report.lowCount}</div>
                <div className="text-sm text-muted-foreground">Low</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      {report.executiveSummary && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{report.executiveSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Findings ({report.totalFindings})
        </h2>
        {report.findings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">Great job! No security vulnerabilities were detected.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {report.findings.map((finding) => (
              <Card key={finding.id} className="border-border">
                <CardContent className="py-4">
                  <button
                    onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(finding.severity)}
                        <span className="font-medium text-foreground">{finding.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="px-2 py-0.5 bg-secondary rounded text-xs">{finding.source}</span>
                        <ChevronIcon className="h-4 w-4" direction={expandedFinding === finding.id ? 'up' : 'down'} />
                      </div>
                    </div>
                    {finding.filePath && (
                      <div className="text-sm text-muted-foreground mt-1 font-mono">
                        {finding.filePath}
                        {finding.lineNumber && `:${finding.lineNumber}`}
                      </div>
                    )}
                  </button>

                  {expandedFinding === finding.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">What it is</h4>
                        <p className="text-foreground">{finding.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Why it matters</h4>
                        <p className="text-foreground">{finding.impact}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">How to fix</h4>
                        <p className="text-foreground whitespace-pre-wrap">{finding.remediation}</p>
                      </div>
                      {finding.codeSnippet && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Code</h4>
                          <pre className="bg-muted border border-border p-3 rounded-lg text-sm text-foreground overflow-x-auto font-mono">
                            {finding.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
