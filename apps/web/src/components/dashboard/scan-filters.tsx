"use client"

import { Input } from "@/components/ui/input"
import { FacetedFilter } from "./faceted-filter"
import { CalendarDateRangePicker } from "./date-range-picker"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { ScanStatus } from "@/lib/constants"
import { DateRange } from "react-day-picker"

interface ScanFiltersProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    statusFilter: Set<string>
    onStatusChange: (values: Set<string>) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
    onClearFilters: () => void
}

export function ScanFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    dateRange,
    onDateRangeChange,
    onClearFilters,
}: ScanFiltersProps) {
    const isFiltered =
        searchQuery ||
        statusFilter.size > 0 ||
        dateRange

    const statusOptions = [
        { label: "Completed", value: "completed" },
        { label: "Scanning", value: "scanning" },
        { label: "Queued", value: "queued" },
        { label: "Failed", value: "failed" },
    ]

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter scans..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px] pl-8"
                    />
                </div>
                <FacetedFilter
                    title="Status"
                    options={statusOptions}
                    selectedValues={statusFilter}
                    onSelect={onStatusChange}
                />
                <CalendarDateRangePicker date={dateRange} setDate={onDateRangeChange} />

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
