'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  findings: Finding[];
}

interface Scan {
  id: string;
  githubRepoUrl: string | null;
  liveUrl: string | null;
  branch: string | null;
  status: string;
  progress: string | null;
  progressPercent: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  report: Report | null;
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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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

export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScan() {
      try {
        const response = await fetch(`${API_URL}/api/scans/${scanId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scan');
        }

        const data = await response.json();
        setScan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchScan();

    // Poll for updates if scan is in progress
    const interval = setInterval(async () => {
      if (scan && !['COMPLETED', 'FAILED', 'CANCELLED'].includes(scan.status)) {
        fetchScan();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scanId, scan?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading scan...
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Error</h3>
            <p className="text-slate-600 mb-4">{error || 'Scan not found'}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-200">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInProgress = !['COMPLETED', 'FAILED', 'CANCELLED'].includes(scan.status);
  const target = scan.githubRepoUrl || scan.liveUrl || 'Unknown';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${scan.githubRepoUrl ? 'bg-slate-100' : 'bg-blue-100'}`}>
              {scan.githubRepoUrl ? (
                <GitHubIcon className="h-5 w-5 text-slate-700" />
              ) : (
                <GlobeIcon className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 truncate max-w-md">{target}</h1>
          </div>
          <p className="text-slate-500">
            Started {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {scan.report && (
            <Link href={`/reports/${scan.report.id}`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                View Report
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-slate-200"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Progress (if in progress) */}
      {isInProgress && (
        <Card className="border-slate-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                <span className="text-slate-900 font-medium">{scan.progress || 'Processing...'}</span>
              </div>
              <span className="text-slate-500">{scan.progressPercent || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${scan.progressPercent || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {scan.status === 'FAILED' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-slate-900 font-medium">Scan Failed</h3>
                <p className="text-slate-600">{scan.errorMessage || 'An error occurred during the scan'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {scan.report && (
        <>
          {/* Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`border md:col-span-1 ${getScoreBg(scan.report.securityScore)}`}>
              <CardContent className="py-6 text-center">
                <div className={`text-6xl font-bold ${getScoreColor(scan.report.securityScore)}`}>
                  {scan.report.securityScore}
                </div>
                <div className="text-slate-500 mt-2">Security Score</div>
                <div className={`text-sm font-medium mt-1 ${getScoreColor(scan.report.securityScore)}`}>
                  {getScoreLabel(scan.report.securityScore)}
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
                    <div className="text-3xl font-bold text-red-600">{scan.report.criticalCount}</div>
                    <div className="text-sm text-slate-500">Critical</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50">
                    <div className="text-3xl font-bold text-amber-600">{scan.report.highCount}</div>
                    <div className="text-sm text-slate-500">High</div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <div className="text-3xl font-bold text-yellow-600">{scan.report.mediumCount}</div>
                    <div className="text-sm text-slate-500">Medium</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <div className="text-3xl font-bold text-blue-600">{scan.report.lowCount}</div>
                    <div className="text-sm text-slate-500">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          {scan.report.executiveSummary && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{scan.report.executiveSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Findings List */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Findings ({scan.report.totalFindings})
            </h2>
            {scan.report.findings.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Issues Found</h3>
                  <p className="text-slate-500">Great job! No security vulnerabilities were detected.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scan.report.findings.map((finding) => (
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
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{finding.source}</span>
                            <ChevronIcon className="h-4 w-4" direction={expandedFinding === finding.id ? 'up' : 'down'} />
                          </div>
                        </div>
                        {finding.filePath && (
                          <div className="text-sm text-slate-500 mt-1 font-mono">
                            {finding.filePath}
                            {finding.lineNumber && `:${finding.lineNumber}`}
                          </div>
                        )}
                      </button>

                      {expandedFinding === finding.id && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">What it is</h4>
                            <p className="text-slate-700">{finding.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">Why it matters</h4>
                            <p className="text-slate-700">{finding.impact}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-500 mb-1">How to fix</h4>
                            <p className="text-slate-700 whitespace-pre-wrap">{finding.remediation}</p>
                          </div>
                          {finding.codeSnippet && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-500 mb-1">Code</h4>
                              <pre className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700 overflow-x-auto font-mono">
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
        </>
      )}
    </div>
  );
}
