/**
 * FindingsList Component
 * Displays security findings with expandable details
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge, SourceBadge } from '@/components/badges';
import { ChevronDownIcon, CheckCircleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Finding } from '@/lib/types';

// ============================================
// Finding Detail Section
// ============================================

interface FindingDetailProps {
  finding: Finding;
}

function FindingDetail({ finding }: FindingDetailProps) {
  return (
    <div className="mt-5 pt-5 border-t border-slate-100 space-y-5">
      {/* What it is */}
      <div className="bg-slate-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">1</span>
          What it is
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed pl-7">{finding.description}</p>
      </div>

      {/* Why it matters */}
      <div className="bg-amber-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-600">2</span>
          Why it matters
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed pl-7">{finding.impact}</p>
      </div>

      {/* How to fix */}
      <div className="bg-emerald-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-600">3</span>
          How to fix
        </h4>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pl-7">
          {finding.remediation}
        </p>
      </div>

      {/* Code snippet */}
      {finding.codeSnippet && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Vulnerable Code</h4>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto font-mono">
            {finding.codeSnippet}
          </pre>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
        <span className="bg-slate-100 px-2 py-1 rounded-md">
          Confidence: {Math.round(finding.confidence * 100)}%
        </span>
        {finding.ruleId && (
          <span className="bg-slate-100 px-2 py-1 rounded-md font-mono">
            {finding.ruleId}
          </span>
        )}
        {finding.aiValidated && (
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            <CheckCircleIcon className="h-3 w-3" />
            AI Validated
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Single Finding Card
// ============================================

interface FindingCardProps {
  finding: Finding;
  isExpanded: boolean;
  onToggle: () => void;
}

function FindingCard({ finding, isExpanded, onToggle }: FindingCardProps) {
  const severityColors: Record<string, string> = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-500',
    MEDIUM: 'border-l-amber-500',
    LOW: 'border-l-gray-400',
  };

  return (
    <Card className={cn(
      'border-slate-200/60 hover:border-slate-300 transition-all hover:shadow-sm border-l-4',
      severityColors[finding.severity.toUpperCase()] || 'border-l-gray-400'
    )}>
      <CardContent className="py-4">
        {/* Header (clickable) */}
        <button onClick={onToggle} className="w-full text-left group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <SeverityBadge severity={finding.severity} />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                  {finding.title}
                </span>
                {/* File path */}
                {finding.filePath && (
                  <div className="text-sm text-slate-500 mt-1 font-mono truncate">
                    {finding.filePath}
                    {finding.lineNumber && (
                      <span className="text-slate-400">:{finding.lineNumber}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SourceBadge source={finding.source} />
              <ChevronDownIcon
                className={cn(
                  'h-5 w-5 text-slate-400 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
          </div>
        </button>

        {/* Expandable detail */}
        {isExpanded && <FindingDetail finding={finding} />}
      </CardContent>
    </Card>
  );
}

// ============================================
// Empty State
// ============================================

function NoFindingsState() {
  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30">
      <CardContent className="py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">All Clear!</h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          No security vulnerabilities were detected in this scan. Your code is looking secure.
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main FindingsList Component
// ============================================

interface FindingsListProps {
  findings: Finding[];
  className?: string;
  defaultExpanded?: boolean;
}

export function FindingsList({
  findings,
  className,
  defaultExpanded = false,
}: FindingsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    defaultExpanded && findings.length > 0 ? findings[0].id : null
  );

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (findings.length === 0) {
    return <NoFindingsState />;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {findings.map((finding) => (
        <FindingCard
          key={finding.id}
          finding={finding}
          isExpanded={expandedId === finding.id}
          onToggle={() => handleToggle(finding.id)}
        />
      ))}
    </div>
  );
}

// ============================================
// FindingsList with Header
// ============================================

interface FindingsListWithHeaderProps extends FindingsListProps {
  title?: string;
  showCount?: boolean;
}

export function FindingsListWithHeader({
  title = 'Findings',
  showCount = true,
  findings,
  ...props
}: FindingsListWithHeaderProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">
        {title}
        {showCount && findings.length > 0 && (
          <span className="text-slate-400 font-normal ml-2">({findings.length})</span>
        )}
      </h2>
      <FindingsList findings={findings} {...props} />
    </div>
  );
}

// ============================================
// Skeleton
// ============================================

export function FindingsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="mt-2 h-3 w-32 bg-slate-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
