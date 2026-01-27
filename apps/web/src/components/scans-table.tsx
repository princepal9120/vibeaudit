'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn, formatDate, getScanTarget } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
      {/* Desktop Table View - Using shadcn Table */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scans.map((scan) => (
              <TableRow
                key={scan.id}
                className="cursor-pointer"
                onClick={() => window.location.href = `/scans/${scan.id}`}
              >
                <TableCell className="font-medium">{getScanTarget(scan)}</TableCell>
                <TableCell>{getScanType(scan)}</TableCell>
                <TableCell>
                  <StatusBadge status={scan.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(scan.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {scans.map((scan) => (
          <Link
            key={scan.id}
            href={`/scans/${scan.id}`}
            className="block bg-card rounded-xl border p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium truncate">{getScanTarget(scan)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{getScanType(scan)}</span>
                  <span>•</span>
                  <span>{formatDate(scan.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={scan.status} size="sm" />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
      {/* Desktop Skeleton - Using shadcn Skeleton */}
      <div className="hidden md:block rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-12" /></TableHead>
              <TableHead><Skeleton className="h-4 w-14" /></TableHead>
              <TableHead><Skeleton className="h-4 w-10" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
