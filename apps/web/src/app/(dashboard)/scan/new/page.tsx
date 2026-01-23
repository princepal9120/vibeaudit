/**
 * New Scan Page
 * Form for creating new security scans
 *
 * Features:
 * - Scan type selection (GitHub, URL, or both)
 * - Form validation
 * - Feature checklist based on scan type
 * - Loading states
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GitHubIcon, GlobeIcon, ShieldIcon, CheckIcon } from '@/components/icons';
import { Spinner } from '@/components/loading';
import { useCreateScan } from '@/hooks';
import { cn, isValidGithubUrl, isValidUrl } from '@/lib/utils';
import type { ScanType, ScanFormData, ScanFormErrors } from '@/lib/types';

// ============================================
// Scan Type Selector
// ============================================

interface ScanTypeSelectorProps {
  selected: ScanType;
  onSelect: (type: ScanType) => void;
}

const scanTypeOptions: { type: ScanType; icon: typeof GitHubIcon; title: string; subtitle: string; iconBg: string }[] = [
  {
    type: 'github',
    icon: GitHubIcon,
    title: 'GitHub Repo',
    subtitle: 'SAST scan',
    iconBg: 'bg-slate-100',
  },
  {
    type: 'url',
    icon: GlobeIcon,
    title: 'Live URL',
    subtitle: 'DAST scan',
    iconBg: 'bg-blue-100',
  },
  {
    type: 'both',
    icon: ShieldIcon,
    title: 'Full Scan',
    subtitle: 'SAST + DAST',
    iconBg: 'bg-purple-100',
  },
];

function ScanTypeSelector({ selected, onSelect }: ScanTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {scanTypeOptions.map(({ type, icon: Icon, title, subtitle, iconBg }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              'p-4 rounded-xl border text-center transition-all',
              isSelected
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <div
              className={cn(
                'h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors',
                isSelected ? 'bg-emerald-100' : iconBg
              )}
            >
              <Icon
                className={cn('h-6 w-6', isSelected ? 'text-emerald-700' : 'text-slate-600')}
              />
            </div>
            <div
              className={cn(
                'font-semibold',
                isSelected ? 'text-emerald-900' : 'text-slate-900'
              )}
            >
              {title}
            </div>
            <div
              className={cn('text-sm', isSelected ? 'text-emerald-600' : 'text-slate-500')}
            >
              {subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Feature Checklist
// ============================================

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

interface FeatureChecklistProps {
  scanType: ScanType;
}

function FeatureChecklist({ scanType }: FeatureChecklistProps) {
  const features = [
    ...(scanType === 'github' || scanType === 'both' ? githubFeatures : []),
    ...(scanType === 'url' || scanType === 'both' ? urlFeatures : []),
  ];

  return (
    <div className="border-t border-slate-100 pt-6">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">What we&apos;ll scan for:</h4>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Form Validation
// ============================================

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
      errors.liveUrl = 'Please enter a valid URL (including https://)';
    }
  }

  return errors;
}

// ============================================
// Form Input Component
// ============================================

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
}

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  type = 'url',
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

// ============================================
// Main New Scan Page Component
// ============================================

export default function NewScanPage() {
  const router = useRouter();
  const { createScan, loading, error: apiError, clearError } = useCreateScan();

  // Form state
  const [formData, setFormData] = useState<ScanFormData>({
    scanType: 'github',
    githubUrl: '',
    liveUrl: '',
    branch: 'main',
  });
  const [errors, setErrors] = useState<ScanFormErrors>({});

  // Update form field
  const updateField = useCallback(
    <K extends keyof ScanFormData>(field: K, value: ScanFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      clearError();
    },
    [clearError]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Build request payload
    const payload: { githubRepoUrl?: string; liveUrl?: string; branch?: string } = {};

    if (formData.scanType === 'github' || formData.scanType === 'both') {
      payload.githubRepoUrl = formData.githubUrl;
      payload.branch = formData.branch || 'main';
    }

    if (formData.scanType === 'url' || formData.scanType === 'both') {
      payload.liveUrl = formData.liveUrl;
    }

    // Create scan
    const scan = await createScan(payload);
    if (scan) {
      router.push(`/scans/${scan.id}`);
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
      <ScanTypeSelector
        selected={formData.scanType}
        onSelect={(type) => updateField('scanType', type)}
      />

      {/* Scan Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Scan Details</CardTitle>
            <CardDescription className="text-slate-500">
              {formData.scanType === 'github' &&
                'Enter your GitHub repository URL to scan for code vulnerabilities'}
              {formData.scanType === 'url' &&
                'Enter your live application URL to scan for security issues'}
              {formData.scanType === 'both' &&
                'Enter both URLs for a comprehensive security scan'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* GitHub URL Input */}
            {(formData.scanType === 'github' || formData.scanType === 'both') && (
              <div className="space-y-4">
                <FormInput
                  label="GitHub Repository URL"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubUrl}
                  onChange={(value) => updateField('githubUrl', value)}
                  error={errors.githubUrl}
                />
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-500">Branch:</label>
                  <Input
                    type="text"
                    placeholder="main"
                    value={formData.branch}
                    onChange={(e) => updateField('branch', e.target.value)}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 max-w-[200px]"
                  />
                </div>
              </div>
            )}

            {/* Live URL Input */}
            {(formData.scanType === 'url' || formData.scanType === 'both') && (
              <FormInput
                label="Live Application URL"
                placeholder="https://your-app.com"
                value={formData.liveUrl}
                onChange={(value) => updateField('liveUrl', value)}
                error={errors.liveUrl}
                hint="We'll scan for security headers, SSL issues, and common vulnerabilities"
              />
            )}

            {/* Feature Checklist */}
            <FeatureChecklist scanType={formData.scanType} />

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{apiError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Starting scan...
                </span>
              ) : (
                'Start Security Scan'
              )}
            </Button>

            {/* Privacy Note */}
            <p className="text-xs text-slate-500 text-center">
              Scans typically complete in under 3 minutes. Your code is never stored.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
