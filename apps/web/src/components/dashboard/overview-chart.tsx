"use client"

import { useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ScanWithReportSummary } from "@/lib/types"

interface OverviewChartProps {
    scans: ScanWithReportSummary[]
    className?: string
}

export function OverviewChart({ scans, className }: OverviewChartProps) {
    // Aggregate scan data by date
    const data = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return d.toISOString().split("T")[0] // YYYY-MM-DD
        })

        return last7Days.map((date) => {
            const dayScans = scans.filter((s) => s.createdAt.startsWith(date))
            const avgScore = dayScans.length > 0
                ? Math.round(dayScans.reduce((acc, s) => acc + (s.report?.securityScore || 0), 0) / dayScans.length)
                : null

            return {
                date: new Date(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
                scans: dayScans.length,
                score: avgScore,
            }
        })
    }, [scans])

    if (scans.length === 0) return null

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Scan Activity</CardTitle>
                <CardDescription>
                    Daily scan volume and average security scores over the last 7 days.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    boxShadow: "var(--shadow-md)",
                                }}
                                labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: "0.25rem" }}
                                itemStyle={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="scans"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorScans)"
                                name="Total Scans"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
