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
    <div className="mt-5 pt-5 border-t border-[#27272A] space-y-4">
      {/* What it is */}
      <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/15 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-xs text-[#3B82F6]">1</span>
          What it is
        </h4>
        <p className="text-[#A1A1AA] text-sm leading-relaxed pl-7">{finding.description}</p>
      </div>

      {/* Why it matters */}
      <div className="bg-[#EAB308]/5 border border-[#EAB308]/15 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-[#EAB308]/20 flex items-center justify-center text-xs text-[#EAB308]">2</span>
          Why it matters
        </h4>
        <p className="text-[#A1A1AA] text-sm leading-relaxed pl-7">{finding.impact}</p>
      </div>

      {/* How to fix */}
      <div className="bg-[#22C55E]/5 border border-[#22C55E]/15 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-xs text-[#22C55E]">3</span>
          How to fix
        </h4>
        <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-wrap pl-7">
          {finding.remediation}
        </p>
      </div>

      {/* Code snippet */}
      {finding.codeSnippet && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Vulnerable Code</h4>
          <pre className="bg-[#09090B] border border-[#27272A] text-[#A1A1AA] p-4 rounded-lg text-sm overflow-x-auto font-mono">
            {finding.codeSnippet}
          </pre>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#71717A]">
        <span className="bg-[#27272A] px-2 py-1 rounded-md">
          Confidence: {Math.round(finding.confidence * 100)}%
        </span>
        {finding.ruleId && (
          <span className="bg-[#27272A] px-2 py-1 rounded-md font-mono">
            {finding.ruleId}
          </span>
        )}
        {finding.aiValidated && (
          <span className="flex items-center gap-1 text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-md">
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
      'border-[#27272A] hover:border-[#3F3F46] transition-all hover:bg-[#18181B]/50 border-l-4',
      severityColors[finding.severity.toUpperCase()] || 'border-l-[#52525B]'
    )}>
      <CardContent className="py-4">
        {/* Header (clickable) */}
        <button onClick={onToggle} className="w-full text-left group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <SeverityBadge severity={finding.severity} />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-white group-hover:text-[#A1A1AA] transition-colors block">
                  {finding.title}
                </span>
                {/* File path */}
                {finding.filePath && (
                  <div className="text-sm text-[#71717A] mt-1 font-mono truncate">
                    {finding.filePath}
                    {finding.lineNumber && (
                      <span className="text-[#52525B]">:{finding.lineNumber}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SourceBadge source={finding.source} />
              <ChevronDownIcon
                className={cn(
                  'h-5 w-5 text-[#71717A] transition-transform',
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
    <Card className="border-[#22C55E]/20 bg-[#22C55E]/5">
      <CardContent className="py-16 text-center">
        <div className="h-16 w-16 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-8 w-8 text-[#22C55E]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
        <p className="text-[#71717A] max-w-sm mx-auto text-sm">
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
      <h2 className="text-lg font-semibold text-white">
        {title}
        {showCount && findings.length > 0 && (
          <span className="text-[#52525B] font-normal ml-2">({findings.length})</span>
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
        <Card key={i} className="border-[#27272A]">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-[#27272A] rounded animate-pulse" />
              <div className="h-4 w-48 bg-[#27272A] rounded animate-pulse" />
            </div>
            <div className="mt-2 h-3 w-32 bg-[#27272A] rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
