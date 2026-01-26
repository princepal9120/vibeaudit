'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Globe, Shield, Check, Loader2 } from 'lucide-react';
import { useCreateScan } from '@/hooks';
import { cn, isValidGithubUrl, isValidUrl } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanType, ScanFormData, ScanFormErrors } from '@/lib/types';

// Scan type configuration
const scanTypes = [
  {
    type: 'github' as ScanType,
    icon: Github,
    title: 'GitHub Repo',
    description: 'SAST scan',
  },
  {
    type: 'url' as ScanType,
    icon: Globe,
    title: 'Live URL',
    description: 'DAST scan',
  },
  {
    type: 'both' as ScanType,
    icon: Shield,
    title: 'Full Scan',
    description: 'SAST + DAST',
  },
];

const githubFeatures = [
  'Hardcoded secrets & API keys',
  'SQL injection vulnerabilities',
  'XSS vulnerabilities',
  'Dependency vulnerabilities',
  'Authentication issues',
  'Code quality problems',
];

const urlFeatures = [
  'Security headers (CSP, HSTS)',
  'SSL/TLS configuration',
  'Cookie security flags',
  'Common web vulnerabilities',
];

function validateForm(data: ScanFormData): ScanFormErrors {
  const errors: ScanFormErrors = {};

  if (data.scanType === 'github' || data.scanType === 'both') {
    if (!data.githubUrl) {
      errors.githubUrl = 'GitHub repository URL is required';
    } else if (!isValidGithubUrl(data.githubUrl)) {
      errors.githubUrl = 'Please enter a valid GitHub repository URL';
    }
  }

  if (data.scanType === 'url' || data.scanType === 'both') {
    if (!data.liveUrl) {
      errors.liveUrl = 'Live URL is required';
    } else if (!isValidUrl(data.liveUrl)) {
      errors.liveUrl = 'Please enter a valid URL';
    }
  }

  return errors;
}

export default function NewScanPage() {
  const router = useRouter();
  const { createScan, loading } = useCreateScan();

  const [formData, setFormData] = useState<ScanFormData>({
    scanType: 'github',
    githubUrl: '',
    liveUrl: '',
    branch: 'main',
  });
  const [errors, setErrors] = useState<ScanFormErrors>({});

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const scan = await createScan({
        githubRepoUrl: formData.scanType !== 'url' ? formData.githubUrl : undefined,
        liveUrl: formData.scanType !== 'github' ? formData.liveUrl : undefined,
        branch: formData.branch || undefined,
      });

      if (scan?.id) {
        toast.success('Scan started successfully');
        router.push(`/scans/${scan.id}`);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create scan. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  }, [formData, createScan, router]);

  const features = [
    ...(formData.scanType === 'github' || formData.scanType === 'both' ? githubFeatures : []),
    ...(formData.scanType === 'url' || formData.scanType === 'both' ? urlFeatures : []),
  ];

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">New Security Scan</h1>
        <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
          Scan your GitHub repository or live application for vulnerabilities
        </p>
      </div>

      {/* Scan Type Selection */}
      <div className="space-y-3 md:space-y-4">
        <label className="text-sm font-medium text-foreground">Select Scan Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {scanTypes.map(({ type, icon: Icon, title, description }) => {
            const isSelected = formData.scanType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, scanType: type }))}
                className={cn(
                  'p-4 sm:p-6 rounded-xl text-left transition-all',
                  isSelected
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-card border border-border hover:border-input'
                )}
              >
                <div className="flex sm:block items-center gap-3 sm:gap-0">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0',
                      isSelected ? 'bg-primary' : 'bg-secondary'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', isSelected ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium text-foreground">{title}</div>
                    <div className={cn('text-xs sm:text-[13px]', isSelected ? 'text-foreground/80' : 'text-muted-foreground')}>
                      {description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div>
          <h3 className="text-sm sm:text-base font-medium text-foreground">Scan Details</h3>
          <p className="text-xs sm:text-[13px] text-muted-foreground mt-1">
            {formData.scanType === 'url'
              ? 'Enter your live URL to scan for vulnerabilities'
              : 'Enter your GitHub repository URL to scan for code vulnerabilities'}
          </p>
        </div>

        <div className="space-y-4">
          {/* GitHub URL Input */}
          {(formData.scanType === 'github' || formData.scanType === 'both') && (
            <div className="space-y-2">
              <label className="text-xs sm:text-[13px] font-medium text-foreground">GitHub Repository URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username/repo"
                className={cn(
                  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.githubUrl ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.githubUrl && <p className="text-xs text-red-500">{errors.githubUrl}</p>}
            </div>
          )}

          {/* Live URL Input */}
          {(formData.scanType === 'url' || formData.scanType === 'both') && (
            <div className="space-y-2">
              <label className="text-xs sm:text-[13px] font-medium text-foreground">Live URL</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://your-app.com"
                className={cn(
                  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.liveUrl ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.liveUrl && <p className="text-xs text-red-500">{errors.liveUrl}</p>}
            </div>
          )}

          {/* Branch Input */}
          {(formData.scanType === 'github' || formData.scanType === 'both') && (
            <div className="space-y-2">
              <label className="text-xs sm:text-[13px] font-medium text-foreground">Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                placeholder="main"
                className="w-full sm:w-[200px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* What we scan for */}
      <div className="space-y-3 md:space-y-4">
        <label className="text-sm font-medium text-foreground">What we&apos;ll scan for:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground text-sm sm:text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Starting Scan...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Start Security Scan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
