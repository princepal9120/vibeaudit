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
  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    QUEUED: { variant: 'secondary', label: 'Queued' },
    CLONING: { variant: 'secondary', label: 'Cloning' },
    SCANNING: { variant: 'default', label: 'Scanning' },
    ANALYZING: { variant: 'default', label: 'Analyzing' },
    GENERATING_REPORT: { variant: 'default', label: 'Generating' },
    COMPLETED: { variant: 'outline', label: 'Completed' },
    FAILED: { variant: 'destructive', label: 'Failed' },
    CANCELLED: { variant: 'secondary', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
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
        <div className="text-gray-400">Loading scans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor your security scans and findings</p>
        </div>
        <Link href="/scan/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            + New Scan
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalScans}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{completedScans}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Avg Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore > 0 ? `${avgScore}/100` : '-'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{totalFindings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && scans.length === 0 && !error && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No scans yet</h3>
            <p className="text-gray-400 mb-6">
              Start your first security scan to see results here
            </p>
            <Link href="/scan/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Start Your First Scan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Scans List */}
      {scans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Scans</h2>
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link key={scan.id} href={`/scans/${scan.id}`}>
                <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {scan.githubRepoUrl ? '📁' : '🌐'}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {getScanTarget(scan)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(scan.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {scan.report?.securityScore !== undefined && (
                          <div className={`text-2xl font-bold ${getScoreColor(scan.report.securityScore)}`}>
                            {scan.report.securityScore}
                          </div>
                        )}
                        {scan.report && (
                          <div className="flex items-center gap-2 text-sm">
                            {scan.report.criticalCount > 0 && (
                              <span className="text-red-500">{scan.report.criticalCount} critical</span>
                            )}
                            {scan.report.highCount > 0 && (
                              <span className="text-orange-500">{scan.report.highCount} high</span>
                            )}
                          </div>
                        )}
                        {getStatusBadge(scan.status)}
                      </div>
                    </div>
                    {scan.status !== 'COMPLETED' && scan.status !== 'FAILED' && scan.progressPercent !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                          <span>{scan.progress}</span>
                          <span>{scan.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
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
