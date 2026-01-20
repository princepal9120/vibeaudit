'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ScanType = 'github' | 'url' | 'both';

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

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

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
        <h1 className="text-3xl font-bold text-slate-900">New Security Scan</h1>
        <p className="text-slate-500 mt-1">
          Scan your GitHub repository or live application for vulnerabilities
        </p>
      </div>

      {/* Scan Type Selection */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setScanType('github')}
          className={`p-4 rounded-lg border text-center transition-all ${
            scanType === 'github'
              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`h-10 w-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
            scanType === 'github' ? 'bg-emerald-100' : 'bg-slate-100'
          }`}>
            <GitHubIcon className={`h-5 w-5 ${scanType === 'github' ? 'text-emerald-700' : 'text-slate-600'}`} />
          </div>
          <div className={`font-medium ${scanType === 'github' ? 'text-emerald-900' : 'text-slate-900'}`}>
            GitHub Repo
          </div>
          <div className={`text-sm ${scanType === 'github' ? 'text-emerald-600' : 'text-slate-500'}`}>
            SAST scan
          </div>
        </button>
        <button
          onClick={() => setScanType('url')}
          className={`p-4 rounded-lg border text-center transition-all ${
            scanType === 'url'
              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`h-10 w-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
            scanType === 'url' ? 'bg-emerald-100' : 'bg-blue-100'
          }`}>
            <GlobeIcon className={`h-5 w-5 ${scanType === 'url' ? 'text-emerald-700' : 'text-blue-600'}`} />
          </div>
          <div className={`font-medium ${scanType === 'url' ? 'text-emerald-900' : 'text-slate-900'}`}>
            Live URL
          </div>
          <div className={`text-sm ${scanType === 'url' ? 'text-emerald-600' : 'text-slate-500'}`}>
            DAST scan
          </div>
        </button>
        <button
          onClick={() => setScanType('both')}
          className={`p-4 rounded-lg border text-center transition-all ${
            scanType === 'both'
              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className={`h-10 w-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
            scanType === 'both' ? 'bg-emerald-100' : 'bg-purple-100'
          }`}>
            <ShieldIcon className={`h-5 w-5 ${scanType === 'both' ? 'text-emerald-700' : 'text-purple-600'}`} />
          </div>
          <div className={`font-medium ${scanType === 'both' ? 'text-emerald-900' : 'text-slate-900'}`}>
            Both
          </div>
          <div className={`text-sm ${scanType === 'both' ? 'text-emerald-600' : 'text-slate-500'}`}>
            Full scan
          </div>
        </button>
      </div>

      {/* Scan Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Scan Details</CardTitle>
            <CardDescription className="text-slate-500">
              {scanType === 'github' && 'Enter your GitHub repository URL to scan for code vulnerabilities'}
              {scanType === 'url' && 'Enter your live application URL to scan for security issues'}
              {scanType === 'both' && 'Enter both URLs for a comprehensive security scan'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub URL */}
            {(scanType === 'github' || scanType === 'both') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  GitHub Repository URL
                </label>
                <Input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-4">
                  <label className="text-sm text-slate-500">Branch:</label>
                  <Input
                    type="text"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 max-w-[200px]"
                  />
                </div>
              </div>
            )}

            {/* Live URL */}
            {(scanType === 'url' || scanType === 'both') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Live Application URL
                </label>
                <Input
                  type="url"
                  placeholder="https://your-app.com"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-sm text-slate-500">
                  We'll scan for security headers, SSL issues, and common vulnerabilities
                </p>
              </div>
            )}

            {/* What we scan */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">What we'll scan for:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                {(scanType === 'github' || scanType === 'both') && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Hardcoded secrets & API keys
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      SQL injection vulnerabilities
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      XSS vulnerabilities
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Dependency vulnerabilities
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Authentication issues
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Code quality problems
                    </div>
                  </>
                )}
                {(scanType === 'url' || scanType === 'both') && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Security headers (CSP, HSTS)
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      SSL/TLS configuration
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Cookie security flags
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      Common web vulnerabilities
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting scan...
                </span>
              ) : (
                'Start Security Scan'
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Scans typically complete in under 3 minutes. Your code is never stored.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
