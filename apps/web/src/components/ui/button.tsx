import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary emerald button
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30",
        // Electric green for dark backgrounds - with shimmer
        electric:
          "relative overflow-hidden bg-[#00FF88] text-[#0F1419] shadow-lg shadow-[#00FF88]/20 hover:bg-[#00FF88]/90 hover:shadow-[#00FF88]/30 font-bold before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        // Destructive/danger actions
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Outline button
        outline:
          "border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-accent",
        // Outline green for secondary actions
        "outline-green":
          "border border-primary text-primary bg-transparent hover:bg-primary/10",
        // Outline white for dark backgrounds
        "outline-white":
          "border border-white/20 text-white bg-transparent hover:bg-white/10 hover:border-white/40",
        // Secondary muted button
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        // Ghost button (minimal)
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        // Link style
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-auto py-3 px-4 text-sm rounded-lg", // 12px vertical, 16px horizontal, 8px radius
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-auto py-4 px-8 text-base rounded-xl",
        xl: "h-auto py-5 px-10 text-lg rounded-2xl",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
