'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn, formatDate, getScanTarget } from '@/lib/utils';
import type { ScanWithReportSummary } from '@/lib/types';
import type { ScanStatus } from '@/lib/constants';

interface StatusBadgeProps {
  status: ScanStatus;
  size?: 'sm' | 'default';
}

function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', label: 'Completed' },
    SCANNING: { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', label: 'Scanning' },
    QUEUED: { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', label: 'Queued' },
    FAILED: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', label: 'Failed' },
    CLONING: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Cloning' },
    ANALYZING: { bg: 'bg-[#E0E7FF]', text: 'text-[#3730A3]', label: 'Analyzing' },
    GENERATING_REPORT: { bg: 'bg-[#FCE7F3]', text: 'text-[#9D174D]', label: 'Generating' },
    CANCELLED: { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: 'Cancelled' },
  };

  const config = statusConfig[status] || statusConfig.QUEUED;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        config.bg,
        config.text
      )}
    >
      {config.label}
    </span>
  );
}

function getScanType(scan: ScanWithReportSummary): string {
  if (scan.githubRepoUrl && scan.liveUrl) return 'SAST + DAST';
  if (scan.githubRepoUrl) return 'SAST';
  return 'DAST';
}

interface ScansTableProps {
  scans: ScanWithReportSummary[];
}

export function ScansTable({ scans }: ScansTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Repository</span>
          <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Type</span>
          <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Status</span>
          <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">Date</span>
        </div>

        {/* Table Rows */}
        {scans.map((scan, index) => (
          <Link
            key={scan.id}
            href={`/scans/${scan.id}`}
            className={cn(
              'grid grid-cols-4 gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer',
              index !== scans.length - 1 && 'border-b border-[#E5E7EB]'
            )}
          >
            <span className="text-sm font-medium text-[#111827] truncate">{getScanTarget(scan)}</span>
            <span className="text-sm text-[#4B5563]">{getScanType(scan)}</span>
            <div>
              <StatusBadge status={scan.status} />
            </div>
            <span className="text-sm text-[#9CA3AF]">{formatDate(scan.createdAt)}</span>
          </Link>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {scans.map((scan) => (
          <Link
            key={scan.id}
            href={`/scans/${scan.id}`}
            className="block bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 hover:border-[#CCFF00] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-[#111827] truncate">{getScanTarget(scan)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span>{getScanType(scan)}</span>
                  <span>•</span>
                  <span>{formatDate(scan.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={scan.status} size="sm" />
                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ScansTableSkeleton() {
  return (
    <>
      {/* Desktop Skeleton */}
      <div className="hidden md:block rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={cn('grid grid-cols-4 gap-4 px-5 py-4', i !== 2 && 'border-b border-[#E5E7EB]')}>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
