'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Scan {
  id: string;
  githubRepoUrl: string | null;
  liveUrl: string | null;
  status: string;
  progress: string | null;
  progressPercent: number | null;
  totalFindings: number | null;
  criticalCount: number | null;
  highCount: number | null;
  mediumCount: number | null;
  lowCount: number | null;
  createdAt: string;
  completedAt: string | null;
  report?: {
    id: string;
    securityScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
  } | null;
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    QUEUED: { className: 'bg-slate-100 text-slate-700', label: 'Queued' },
    CLONING: { className: 'bg-blue-100 text-blue-700', label: 'Cloning' },
    SCANNING: { className: 'bg-emerald-100 text-emerald-700', label: 'Scanning' },
    ANALYZING: { className: 'bg-emerald-100 text-emerald-700', label: 'Analyzing' },
    GENERATING_REPORT: { className: 'bg-emerald-100 text-emerald-700', label: 'Generating' },
    COMPLETED: { className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Completed' },
    FAILED: { className: 'bg-red-100 text-red-700', label: 'Failed' },
    CANCELLED: { className: 'bg-slate-100 text-slate-700', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { className: 'bg-slate-100 text-slate-700', label: status };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-50';
  if (score >= 50) return 'bg-amber-50';
  return 'bg-red-50';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getScanTarget(scan: Scan): string {
  if (scan.githubRepoUrl) {
    const match = scan.githubRepoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
    return match ? match[1] : scan.githubRepoUrl;
  }
  if (scan.liveUrl) {
    try {
      return new URL(scan.liveUrl).hostname;
    } catch {
      return scan.liveUrl;
    }
  }
  return 'Unknown';
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

export default function DashboardPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScans() {
      try {
        const response = await fetch(`${API_URL}/api/scans`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch scans');
        }

        const data = await response.json();
        setScans(data.scans);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchScans();
  }, []);

  // Calculate stats
  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === 'COMPLETED').length;
  const avgScore = completedScans > 0
    ? Math.round(scans.filter(s => s.report?.securityScore).reduce((acc, s) => acc + (s.report?.securityScore || 0), 0) / completedScans)
    : 0;
  const totalFindings = scans.reduce((acc, s) => acc + (s.report?.totalFindings || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading scans...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Monitor your security scans and findings</p>
        </div>
        <Link href="/scan/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            + New Scan
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500">Total Scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalScans}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500">Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{completedScans}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500">Avg Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${avgScore > 0 ? getScoreColor(avgScore) : 'text-slate-400'}`}>
              {avgScore > 0 ? `${avgScore}/100` : '-'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500">Total Findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{totalFindings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && scans.length === 0 && !error && (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No scans yet</h3>
            <p className="text-slate-500 mb-6">
              Start your first security scan to see results here
            </p>
            <Link href="/scan/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Your First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Scans List */}
      {scans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent Scans</h2>
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link key={scan.id} href={`/scans/${scan.id}`}>
                <Card className="border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${scan.githubRepoUrl ? 'bg-slate-100' : 'bg-blue-100'}`}>
                          {scan.githubRepoUrl ? (
                            <GitHubIcon className="h-5 w-5 text-slate-700" />
                          ) : (
                            <GlobeIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {getScanTarget(scan)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(scan.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {scan.report?.securityScore !== undefined && (
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getScoreBg(scan.report.securityScore)}`}>
                            <span className={`text-lg font-bold ${getScoreColor(scan.report.securityScore)}`}>
                              {scan.report.securityScore}
                            </span>
                          </div>
                        )}
                        {scan.report && (
                          <div className="flex items-center gap-2 text-sm">
                            {scan.report.criticalCount > 0 && (
                              <span className="text-red-600 font-medium">{scan.report.criticalCount} critical</span>
                            )}
                            {scan.report.highCount > 0 && (
                              <span className="text-amber-600 font-medium">{scan.report.highCount} high</span>
                            )}
                          </div>
                        )}
                        {getStatusBadge(scan.status)}
                      </div>
                    </div>
                    {scan.status !== 'COMPLETED' && scan.status !== 'FAILED' && scan.progressPercent !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                          <span>{scan.progress}</span>
                          <span>{scan.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${scan.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
