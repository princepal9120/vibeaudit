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
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
      {/* What it is */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">What it is</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{finding.description}</p>
      </div>

      {/* Why it matters */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Why it matters</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{finding.impact}</p>
      </div>

      {/* How to fix */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">How to fix</h4>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
          {finding.remediation}
        </p>
      </div>

      {/* Code snippet */}
      {finding.codeSnippet && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Code</h4>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
            {finding.codeSnippet}
          </pre>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
        <span>Confidence: {Math.round(finding.confidence * 100)}%</span>
        {finding.ruleId && <span>Rule: {finding.ruleId}</span>}
        {finding.aiValidated && (
          <span className="flex items-center gap-1 text-emerald-600">
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
  return (
    <Card className="border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="py-4">
        {/* Header (clickable) */}
        <button onClick={onToggle} className="w-full text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SeverityBadge severity={finding.severity} />
              <span className="font-medium text-slate-900">{finding.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <SourceBadge source={finding.source} />
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
          </div>

          {/* File path */}
          {finding.filePath && (
            <div className="text-sm text-slate-500 mt-2 font-mono">
              {finding.filePath}
              {finding.lineNumber && (
                <span className="text-slate-400">:{finding.lineNumber}</span>
              )}
            </div>
          )}
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
    <Card className="border-slate-200">
      <CardContent className="py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Issues Found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Great job! No security vulnerabilities were detected in this scan.
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
