'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrdFinding, FrameworkCoverage } from '@/lib/api';

interface PrdFindingsPanelProps {
  findings: PrdFinding[];
  frameworkCoverage: FrameworkCoverage[];
}

const severityConfig = {
  CRITICAL: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  MEDIUM: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  LOW: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
};

export function PrdFindingsPanel({ findings, frameworkCoverage }: PrdFindingsPanelProps) {
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'findings' | 'coverage'>('findings');

  // Group findings by framework
  const findingsByFramework = findings.reduce(
    (acc, finding) => {
      const key = finding.framework;
      if (!acc[key]) acc[key] = [];
      acc[key].push(finding);
      return acc;
    },
    {} as Record<string, PrdFinding[]>
  );

  // Count by severity
  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      {/* Severity Summary */}
      <div className="flex flex-wrap gap-2">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => {
          const count = severityCounts[severity] || 0;
          if (count === 0) return null;

          const config = severityConfig[severity];
          return (
            <div
              key={severity}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}
            >
              <span>{count}</span>
              <span>{severity}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('findings')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'findings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Findings ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('coverage')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'coverage'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Framework Coverage
        </button>
      </div>

      {/* Content */}
      {activeTab === 'findings' ? (
        <div className="space-y-4">
          {Object.entries(findingsByFramework).map(([frameworkId, frameworkFindings]) => {
            const coverage = frameworkCoverage.find((fc) => fc.framework === frameworkId);
            return (
              <div key={frameworkId} className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  {coverage?.frameworkName || frameworkId}
                </h4>

                <div className="space-y-2">
                  {frameworkFindings.map((finding) => {
                    const config = severityConfig[finding.severity];
                    const Icon = config.icon;
                    const isExpanded = expandedFinding === finding.id;

                    return (
                      <div
                        key={finding.id}
                        className={cn('rounded-lg border', config.border, config.bg)}
                      >
                        <button
                          onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                          className="w-full px-3 py-2.5 flex items-start gap-2 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                          ) : (
                            <ChevronRight className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                          )}
                          <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-foreground">{finding.title}</span>
                              <span className={cn('text-xs px-1.5 py-0.5 rounded', config.bg, config.color)}>
                                {finding.severity}
                              </span>
                            </div>
                            {!isExpanded && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {finding.description}
                              </p>
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-3 space-y-3 border-t border-border/50 pt-3 mx-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                              <p className="text-sm text-foreground">{finding.description}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                              <p className="text-sm text-foreground">{finding.recommendation}</p>
                            </div>
                            {finding.section && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Relevant Section</p>
                                <p className="text-sm text-foreground">{finding.section}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {findings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No security issues found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {frameworkCoverage.map((coverage) => (
            <div key={coverage.framework} className="p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{coverage.frameworkName}</span>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    coverage.coveragePercent >= 80
                      ? 'bg-green-500/10 text-green-500'
                      : coverage.coveragePercent >= 50
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-red-500/10 text-red-500'
                  )}
                >
                  {coverage.coveragePercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className={cn(
                    'h-full rounded-full',
                    coverage.coveragePercent >= 80
                      ? 'bg-green-500'
                      : coverage.coveragePercent >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${coverage.coveragePercent}%` }}
                />
              </div>

              {coverage.missingItems.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Missing: </span>
                  {coverage.missingItems.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
