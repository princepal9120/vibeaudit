'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Globe, Shield, Check, Loader2, FileText, Upload, Search } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
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
    description: 'DAST + Launch Readiness',
  },
  {
    type: 'file' as ScanType,
    icon: FileText,
    title: 'PRD Upload',
    description: 'Architecture Review',
  },
  {
    type: 'both' as ScanType,
    icon: Shield,
    title: 'Full Scan',
    description: 'SAST + DAST + Launch',
  },
  {
    type: 'conversion' as ScanType,
    icon: Search,
    title: 'Conversion Audit',
    description: 'Messaging + CTA review',
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
  'SEO readiness (meta tags, OG, sitemap)',
  'Performance (load time, compression)',
  'Accessibility (alt text, ARIA, headings)',
  'Launch essentials (favicon, 404, legal pages)',
];

const prdFeatures = [
  'Architecture flaws',
  'Missing security controls',
  'Compliance gaps (SOC2, HIPAA)',
  'Data flow risks',
  'Authentication gaps',
];

const conversionFeatures = [
  'What your page seems to say in one sentence',
  'Weak messaging, trust, and CTA friction',
  'Sharper positioning and clearer value proposition',
  'A rewritten headline and subheadline',
  '3-5 stronger benefit bullets',
  'Better CTA, social proof, and trust signals',
];

function validateForm(data: ScanFormData & { file?: File | null }): ScanFormErrors & { file?: string } {
  const errors: ScanFormErrors & { file?: string } = {};

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

  if (data.scanType === 'conversion') {
    if (!data.liveUrl) {
      errors.liveUrl = 'Landing page URL is required';
    } else if (!isValidUrl(data.liveUrl)) {
      errors.liveUrl = 'Please enter a valid landing page URL';
    }
  }

  if (data.scanType === 'file') {
    if (!data.file) {
      errors.general = 'Please select a PRD file (PDF or Markdown) to upload';
    }
  }

  return errors;
}

export default function NewScanPage() {
  const router = useRouter();
  const { createScan, loading } = useCreateScan();

  const [formData, setFormData] = useState<ScanFormData & { file: File | null }>({
    scanType: 'github',
    githubUrl: '',
    liveUrl: '',
    branch: '',
    file: null,
  });
  const [errors, setErrors] = useState<ScanFormErrors>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const isConversionAudit = formData.scanType === 'conversion';
    const toastId = toast.loading(
      isConversionAudit ? 'Initializing conversion audit...' : 'Initializing security scan...'
    );

    try {
      const scan = await createScan({
        auditType: isConversionAudit ? 'CONVERSION' : 'SECURITY',
        githubRepoUrl:
          formData.scanType !== 'url' &&
          formData.scanType !== 'file' &&
          formData.scanType !== 'conversion'
            ? formData.githubUrl
            : undefined,
        liveUrl:
          formData.scanType !== 'github' && formData.scanType !== 'file'
            ? formData.liveUrl
            : undefined,
        branch:
          formData.scanType === 'github' || formData.scanType === 'both'
            ? formData.branch.trim() || undefined
            : undefined,
        file: formData.scanType === 'file' && formData.file ? formData.file : undefined,
      });

      toast.success(isConversionAudit ? 'Conversion audit started successfully' : 'Scan started successfully', { id: toastId });
      router.push(`/scans/${scan.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scan. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage, { id: toastId });
    }
  }, [formData, createScan, router]);

  const features =
    formData.scanType === 'file' ? prdFeatures :
      formData.scanType === 'conversion' ? conversionFeatures :
      [
        ...(formData.scanType === 'github' || formData.scanType === 'both' ? githubFeatures : []),
        ...(formData.scanType === 'url' || formData.scanType === 'both' ? urlFeatures : []),
      ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <PageHeader
        title="New Audit"
        description="Run a security scan, architecture review, or landing-page conversion audit from one place"
      />

      {/* Scan Type Selection */}
      <div className="space-y-3 md:space-y-4">
        <label className="text-sm font-medium text-foreground">Select Audit Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
          {scanTypes.map(({ type, icon: Icon, title, description }) => {
            const isSelected = formData.scanType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, scanType: type, file: null, githubUrl: '', liveUrl: '' }))}
                className={cn(
                  'p-4 rounded-xl text-left transition-all h-full flex flex-col justify-between',
                  isSelected
                    ? 'bg-primary/5 border-2 border-primary shadow-sm'
                    : 'bg-card border border-border hover:border-input hover:bg-accent/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    {description}
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
          <h3 className="text-sm sm:text-base font-medium text-foreground">
            {formData.scanType === 'conversion' ? 'Audit Details' : 'Scan Details'}
          </h3>
          <p className="text-xs sm:text-[13px] text-muted-foreground mt-1">
            {formData.scanType === 'conversion'
              ? 'Paste your landing page URL and get clarity, trust, positioning, and CTA feedback'
              : formData.scanType === 'url'
              ? 'Enter your live URL to scan for vulnerabilities'
              : formData.scanType === 'file'
                ? 'Upload your PRD or architecture document (PDF, Markdown)'
                : 'Enter your GitHub repository URL to scan for code vulnerabilities'}
          </p>
        </div>

        <div className="space-y-4">
          {/* GitHub URL Input */}
          {(formData.scanType === 'github' || formData.scanType === 'both') && (
            <div className="space-y-2">
              <label htmlFor="github-url" className="text-xs sm:text-[13px] font-medium text-foreground">GitHub Repository URL</label>
              <input
                id="github-url"
                name="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username/repo"
                autoComplete="url"
                className={cn(
                  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.githubUrl ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.githubUrl && <p className="text-xs text-[#EF4444]">{errors.githubUrl}</p>}
            </div>
          )}

          {/* Live URL Input */}
          {(formData.scanType === 'url' || formData.scanType === 'both' || formData.scanType === 'conversion') && (
            <div className="space-y-2">
              <label htmlFor="live-url" className="text-xs sm:text-[13px] font-medium text-foreground">
                {formData.scanType === 'conversion' ? 'Landing Page URL' : 'Live URL'}
              </label>
              <input
                id="live-url"
                name="liveUrl"
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))}
                placeholder={formData.scanType === 'conversion' ? 'https://yourlandingpage.com' : 'https://your-app.com'}
                autoComplete="url"
                className={cn(
                  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.liveUrl ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.liveUrl && <p className="text-xs text-[#EF4444]">{errors.liveUrl}</p>}
            </div>
          )}

          {/* File Upload Input */}
          {formData.scanType === 'file' && (
            <div className="space-y-3">
              <label htmlFor="prd-file" className="block text-xs sm:text-[13px] font-medium text-foreground">Upload Document</label>
              <div className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:bg-accent/50 cursor-pointer relative",
                formData.file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"
              )}>
                <input
                  type="file"
                  id="prd-file"
                  accept=".pdf,.md,.txt,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                    {formData.file ? <FileText className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  {formData.file ? (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{formData.file.name}</p>
                      <p className="text-xs text-muted-foreground">{(formData.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, Markdown or Text (max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Branch Input */}
          {(formData.scanType === 'github' || formData.scanType === 'both') && (
            <div className="space-y-2">
              <label htmlFor="branch" className="text-xs sm:text-[13px] font-medium text-foreground">Branch</label>
              <input
                id="branch"
                name="branch"
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
                placeholder="Leave blank to use the repo default branch"
                autoComplete="off"
                className="w-full sm:w-[200px] px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground">Optional. Leave empty to scan the repository&apos;s default branch.</p>
            </div>
          )}
        </div>
      </div>

      {/* What we scan for */}
      <div className="space-y-3 md:space-y-4">
        <label className="text-sm font-medium text-foreground">
          {formData.scanType === 'conversion' ? 'What we&apos;ll audit:' : 'What we&apos;ll scan for:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#22C55E]" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20">
          <p className="text-sm text-[#EF4444]">{errors.general}</p>
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
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>{formData.scanType === 'conversion' ? 'Starting Audit…' : 'Starting Scan…'}</span>
            </>
          ) : (
            <>
              {formData.scanType === 'conversion' ? (
                <Search className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Shield className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{formData.scanType === 'conversion' ? 'Start Conversion Audit' : 'Start Security Scan'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
