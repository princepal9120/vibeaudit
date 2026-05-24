import type { ReportSummary } from '../types';

export type Scan = {
    id: string
    status: string
    githubRepoUrl?: string
    liveUrl?: string
    branch?: string
    createdAt: string
    completedAt?: string
    startedAt?: string
    progress?: string
    progressPercent?: number
    errorMessage?: string
    report?: ReportSummary | null
}

export type ScanWithReportSummary = Scan & {
    report?: ReportSummary | null
    totalFindings?: number
    criticalCount?: number
}
