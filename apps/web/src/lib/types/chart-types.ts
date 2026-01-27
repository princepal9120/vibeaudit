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
    report?: any // Using any for now to avoid circular deps, refined in types.ts
}

export type ScanWithReportSummary = Scan & {
    report?: {
        id: string
        securityScore: number
        totalFindings: number
        criticalCount: number
        highCount: number
        mediumCount: number
        lowCount: number
        pdfUrl?: string
        executiveSummary?: string
        findings: any[]
    }
    totalFindings?: number
    criticalCount?: number
}
