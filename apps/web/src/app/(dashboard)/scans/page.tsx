'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Plus, Download, Trash2 } from 'lucide-react';
import { isWithinInterval, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable } from '@/components/dashboard/data-table';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScanFilters } from '@/components/dashboard/scan-filters';
import { useScans } from '@/hooks';
import { ScanWithReportSummary } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ScansPage() {
    const router = useRouter();
    const { scans, loading, error, refetch } = useScans();

    // Filtering State
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

    // Derived State: Filtered Scans
    const filteredScans = React.useMemo(() => {
        return scans.filter((scan) => {
            // 1. Text Search (Repo URL or Live URL)
            const matchesSearch = searchQuery === '' ||
                (scan.githubRepoUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (scan.liveUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

            // 2. Status Filter
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(scan.status.toLowerCase());

            // 3. Date Range Filter
            let matchesDate = true;
            if (dateRange?.from && dateRange?.to) {
                const scanDate = parseISO(scan.createdAt);
                matchesDate = isWithinInterval(scanDate, { start: dateRange.from, end: dateRange.to });
            } else if (dateRange?.from) {
                const scanDate = parseISO(scan.createdAt);
                // Check if same day (simple check) or after
                matchesDate = scanDate >= dateRange.from;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [scans, searchQuery, statusFilter, dateRange]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter(new Set());
        setDateRange(undefined);
    };

    const columns: ColumnDef<ScanWithReportSummary>[] = [
        {
            accessorKey: 'createdAt',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="font-medium">
                        {formatDate(row.getValue('createdAt'))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'githubRepoUrl',
            header: 'Repository / URL',
            cell: ({ row }) => {
                const githubUrl = row.original.githubRepoUrl;
                const liveUrl = row.original.liveUrl;
                const displayUrl = githubUrl || liveUrl || '-';

                return (
                    <div className="max-w-[300px] truncate">
                        {displayUrl !== '-' ? (
                            <a
                                href={displayUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {displayUrl}
                            </a>
                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const variant =
                    status === 'completed' ? 'default' :
                        status === 'failed' ? 'destructive' :
                            status === 'pending' || status === 'queued' ? 'secondary' :
                                'outline';

                return (
                    <Badge variant={variant} className="capitalize">
                        {status}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'report',
            header: 'Score',
            cell: ({ row }) => {
                const report = row.original.report;
                if (!report) return <span className="text-muted-foreground">-</span>;

                const score = report.securityScore;
                const color =
                    score >= 80 ? 'text-[#22C55E]' :
                        score >= 60 ? 'text-[#EAB308]' :
                            'text-[#EF4444]';

                return <span className={`font-semibold ${color}`}>{score}</span>;
            },
        },
        {
            accessorKey: 'totalFindings',
            header: 'Findings',
            cell: ({ row }) => {
                const total = row.original.totalFindings || 0;
                const critical = row.original.criticalCount || 0;

                return (
                    <div className="text-sm">
                        <span className="font-medium">{total}</span>
                        {critical > 0 && (
                            <span className="ml-2 text-[#EF4444]">({critical} critical)</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const scan = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => router.push(`/scans/${scan.id}`)}
                            >
                                View details
                            </DropdownMenuItem>
                            {scan.report?.pdfUrl && (
                                <DropdownMenuItem
                                    onClick={() => window.open(scan.report!.pdfUrl!, '_blank')}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download report
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => toast.error("Delete functionality coming soon")}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete scan
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title="Security Scans"
                    description="Manage and monitor your security scans"
                />
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Only show empty state if NO scans exist at all (not just filtered results)
    if (!loading && scans.length === 0) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title="Security Scans"
                    description="Manage and monitor your security scans"
                    actions={
                        <Button onClick={() => router.push('/scan/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Scan
                        </Button>
                    }
                />
                <EmptyState
                    icon={Plus}
                    title="No scans yet"
                    description="Run your first security scan to identify vulnerabilities in your code or live application."
                    action={{
                        label: 'Start Your First Scan',
                        onClick: () => router.push('/scan/new'),
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Security Scans"
                description="Manage and monitor your security scans"
                actions={
                    <Button onClick={() => router.push('/scan/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Scan
                    </Button>
                }
            />

            <div className="space-y-4">
                <ScanFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onClearFilters={handleClearFilters}
                />

                <DataTable
                    columns={columns}
                    data={filteredScans}
                    isLoading={loading}
                    onRowClick={(scan) => router.push(`/scans/${scan.id}`)}
                />
            </div>
        </div>
    );
}
