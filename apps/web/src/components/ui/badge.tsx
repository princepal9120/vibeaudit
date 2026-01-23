import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent",
        // Severity variants for security findings
        critical:
          "border-red-500/20 bg-red-500/10 text-red-500",
        high:
          "border-orange-500/20 bg-orange-500/10 text-orange-500",
        medium:
          "border-amber-500/20 bg-amber-500/10 text-amber-500",
        low:
          "border-gray-500/20 bg-gray-500/10 text-gray-500",
        // Status variants
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-500",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-500",
        // Electric green for primary brand
        electric:
          "border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] shadow-sm shadow-[#00FF88]/10",
      },
      size: {
        default: "h-5 px-2.5 py-0.5 text-[11px]",
        sm: "h-4 px-2 py-0.5 text-[10px]",
        lg: "h-6 px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
  VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Severity badge helper component
interface SeverityBadgeProps extends Omit<BadgeProps, 'variant'> {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string
}

function SeverityBadge({ severity, className, ...props }: SeverityBadgeProps) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  }

  return (
    <Badge
      variant={variantMap[severity.toUpperCase()] || 'outline'}
      className={className}
      {...props}
    >
      {severity}
    </Badge>
  )
}

// Status badge helper component
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'COMPLETED' | 'SCANNING' | 'QUEUED' | 'FAILED' | 'CANCELLED' | string
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    COMPLETED: 'success',
    SCANNING: 'info',
    CLONING: 'info',
    ANALYZING: 'info',
    GENERATING_REPORT: 'info',
    QUEUED: 'secondary',
    FAILED: 'destructive',
    CANCELLED: 'secondary',
  }

  const labelMap: Record<string, string> = {
    COMPLETED: 'Completed',
    SCANNING: 'Scanning...',
    CLONING: 'Cloning...',
    ANALYZING: 'Analyzing...',
    GENERATING_REPORT: 'Generating...',
    QUEUED: 'Queued',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  }

  return (
    <Badge
      variant={variantMap[status.toUpperCase()] || 'outline'}
      className={className}
      {...props}
    >
      {labelMap[status.toUpperCase()] || status}
    </Badge>
  )
}

export { Badge, badgeVariants, SeverityBadge, StatusBadge }
