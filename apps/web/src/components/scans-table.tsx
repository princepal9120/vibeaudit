'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn, formatDate, getScanTarget, getScanTypeLabel } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScanWithReportSummary } from '@/lib/types';
import type { ScanStatus } from '@/lib/constants';

interface StatusBadgeProps {
  status: ScanStatus;
  size?: 'sm' | 'default';
}

function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    COMPLETED: { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', dot: 'bg-[#22C55E]', label: 'Completed' },
    SCANNING: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]', label: 'Scanning' },
    QUEUED: { bg: 'bg-[#71717A]/10', text: 'text-[#71717A]', dot: 'bg-[#71717A]', label: 'Queued' },
    FAILED: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]', label: 'Failed' },
    CLONING: { bg: 'bg-[#EAB308]/10', text: 'text-[#EAB308]', dot: 'bg-[#EAB308]', label: 'Cloning' },
    ANALYZING: { bg: 'bg-[#A855F7]/10', text: 'text-[#A855F7]', dot: 'bg-[#A855F7]', label: 'Analyzing' },
    GENERATING_REPORT: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', dot: 'bg-[#F97316]', label: 'Generating' },
    CANCELLED: { bg: 'bg-[#71717A]/10', text: 'text-[#52525B]', dot: 'bg-[#52525B]', label: 'Cancelled' },
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
              <TableHead>Target</TableHead>
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
                <TableCell>{getScanTypeLabel(scan)}</TableCell>
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
                  <span>{getScanTypeLabel(scan)}</span>
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
