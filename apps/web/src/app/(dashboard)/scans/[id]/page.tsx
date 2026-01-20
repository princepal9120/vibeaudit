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
  const config: Record<string, { variant: 'destructive' | 'default' | 'secondary' | 'outline'; color: string }> = {
    CRITICAL: { variant: 'destructive', color: 'bg-red-500' },
    HIGH: { variant: 'default', color: 'bg-orange-500' },
    MEDIUM: { variant: 'secondary', color: 'bg-yellow-500' },
    LOW: { variant: 'outline', color: 'bg-blue-500' },
  };

  const { variant } = config[severity] || { variant: 'secondary' as const };
  return <Badge variant={variant}>{severity}</Badge>;
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Critical';
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
        <div className="text-gray-400">Loading scan...</div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
            <p className="text-gray-400 mb-4">{error || 'Scan not found'}</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
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
            <span className="text-3xl">{scan.githubRepoUrl ? '📁' : '🌐'}</span>
            <h1 className="text-2xl font-bold text-white truncate max-w-md">{target}</h1>
          </div>
          <p className="text-gray-400">
            Started {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-gray-700"
          >
            Back
          </Button>
        </div>
      </div>

      {/* Progress (if in progress) */}
      {isInProgress && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                <span className="text-white font-medium">{scan.progress || 'Processing...'}</span>
              </div>
              <span className="text-gray-400">{scan.progressPercent || 0}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${scan.progressPercent || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {scan.status === 'FAILED' && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <h3 className="text-white font-medium">Scan Failed</h3>
                <p className="text-gray-400">{scan.errorMessage || 'An error occurred during the scan'}</p>
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
            <Card className="bg-gray-900 border-gray-800 md:col-span-1">
              <CardContent className="py-6 text-center">
                <div className={`text-6xl font-bold ${getScoreColor(scan.report.securityScore)}`}>
                  {scan.report.securityScore}
                </div>
                <div className="text-gray-400 mt-2">Security Score</div>
                <div className={`text-sm font-medium mt-1 ${getScoreColor(scan.report.securityScore)}`}>
                  {getScoreLabel(scan.report.securityScore)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Findings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-red-500">{scan.report.criticalCount}</div>
                    <div className="text-sm text-gray-400">Critical</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-500">{scan.report.highCount}</div>
                    <div className="text-sm text-gray-400">High</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-500">{scan.report.mediumCount}</div>
                    <div className="text-sm text-gray-400">Medium</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">{scan.report.lowCount}</div>
                    <div className="text-sm text-gray-400">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          {scan.report.executiveSummary && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">{scan.report.executiveSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Findings List */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Findings ({scan.report.totalFindings})
            </h2>
            {scan.report.findings.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-8 text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Issues Found</h3>
                  <p className="text-gray-400">Great job! No security vulnerabilities were detected.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scan.report.findings.map((finding) => (
                  <Card key={finding.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="py-4">
                      <button
                        onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getSeverityBadge(finding.severity)}
                            <span className="font-medium text-white">{finding.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>{finding.source}</span>
                            <span>{expandedFinding === finding.id ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        {finding.filePath && (
                          <div className="text-sm text-gray-500 mt-1">
                            {finding.filePath}
                            {finding.lineNumber && `:${finding.lineNumber}`}
                          </div>
                        )}
                      </button>

                      {expandedFinding === finding.id && (
                        <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">What it is</h4>
                            <p className="text-gray-300">{finding.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">Why it matters</h4>
                            <p className="text-gray-300">{finding.impact}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-1">How to fix</h4>
                            <p className="text-gray-300 whitespace-pre-wrap">{finding.remediation}</p>
                          </div>
                          {finding.codeSnippet && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-1">Code</h4>
                              <pre className="bg-gray-950 p-3 rounded text-sm text-gray-300 overflow-x-auto">
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
