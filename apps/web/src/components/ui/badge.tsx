import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // Severity variants for security findings
        critical:
          "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
        high:
          "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        medium:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        low:
          "border-gray-400/30 bg-gray-400/10 text-gray-600 dark:text-gray-400",
        // Status variants
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        info:
          "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        // Electric green for primary brand
        electric:
          "border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
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
