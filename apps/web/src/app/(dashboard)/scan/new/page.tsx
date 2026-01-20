'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ScanType = 'github' | 'url' | 'both';

export default function NewScanPage() {
  const router = useRouter();
  const [scanType, setScanType] = useState<ScanType>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = {};

      if (scanType === 'github' || scanType === 'both') {
        if (!githubUrl) {
          throw new Error('GitHub repository URL is required');
        }
        payload.githubRepoUrl = githubUrl;
        payload.branch = branch;
      }

      if (scanType === 'url' || scanType === 'both') {
        if (!liveUrl) {
          throw new Error('Live URL is required');
        }
        payload.liveUrl = liveUrl;
      }

      const response = await fetch(`${API_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create scan');
      }

      const scan = await response.json();
      router.push(`/scans/${scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">New Security Scan</h1>
        <p className="text-gray-400 mt-1">
          Scan your GitHub repository or live application for vulnerabilities
        </p>
      </div>

      {/* Scan Type Selection */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setScanType('github')}
          className={`p-4 rounded-lg border text-center transition-colors ${
            scanType === 'github'
              ? 'border-orange-500 bg-orange-500/10 text-white'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-3xl mb-2">📁</div>
          <div className="font-medium">GitHub Repo</div>
          <div className="text-sm opacity-70">SAST scan</div>
        </button>
        <button
          onClick={() => setScanType('url')}
          className={`p-4 rounded-lg border text-center transition-colors ${
            scanType === 'url'
              ? 'border-orange-500 bg-orange-500/10 text-white'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-3xl mb-2">🌐</div>
          <div className="font-medium">Live URL</div>
          <div className="text-sm opacity-70">DAST scan</div>
        </button>
        <button
          onClick={() => setScanType('both')}
          className={`p-4 rounded-lg border text-center transition-colors ${
            scanType === 'both'
              ? 'border-orange-500 bg-orange-500/10 text-white'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
          }`}
        >
          <div className="text-3xl mb-2">🔒</div>
          <div className="font-medium">Both</div>
          <div className="text-sm opacity-70">Full scan</div>
        </button>
      </div>

      {/* Scan Form */}
      <form onSubmit={handleSubmit}>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Scan Details</CardTitle>
            <CardDescription className="text-gray-400">
              {scanType === 'github' && 'Enter your GitHub repository URL to scan for code vulnerabilities'}
              {scanType === 'url' && 'Enter your live application URL to scan for security issues'}
              {scanType === 'both' && 'Enter both URLs for a comprehensive security scan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub URL */}
            {(scanType === 'github' || scanType === 'both') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  GitHub Repository URL
                </label>
                <Input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-400">Branch:</label>
                  <Input
                    type="text"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 max-w-[200px]"
                  />
                </div>
              </div>
            )}

            {/* Live URL */}
            {(scanType === 'url' || scanType === 'both') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Live Application URL
                </label>
                <Input
                  type="url"
                  placeholder="https://your-app.com"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <p className="text-sm text-gray-500">
                  We'll scan for security headers, SSL issues, and common vulnerabilities
                </p>
              </div>
            )}

            {/* What we scan */}
            <div className="border-t border-gray-800 pt-6">
              <h4 className="text-sm font-medium text-white mb-3">What we'll scan for:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                {(scanType === 'github' || scanType === 'both') && (
                  <>
                    <div>✓ Hardcoded secrets & API keys</div>
                    <div>✓ SQL injection vulnerabilities</div>
                    <div>✓ XSS vulnerabilities</div>
                    <div>✓ Dependency vulnerabilities</div>
                    <div>✓ Authentication issues</div>
                    <div>✓ Code quality problems</div>
                  </>
                )}
                {(scanType === 'url' || scanType === 'both') && (
                  <>
                    <div>✓ Security headers (CSP, HSTS)</div>
                    <div>✓ SSL/TLS configuration</div>
                    <div>✓ Cookie security flags</div>
                    <div>✓ Common web vulnerabilities</div>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Starting scan...' : 'Start Security Scan'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Scans typically complete in under 3 minutes. Your code is never stored.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
