import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        // Primary cyan button with glow
        default:
          "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary/90 active:scale-[0.98] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        // Glow variant for hero CTAs
        glow:
          "bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(0,217,255,0.3),0_0_40px_rgba(0,217,255,0.15)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5),0_0_60px_rgba(0,217,255,0.25)] active:scale-[0.98] transition-all duration-300",
        // Coral accent for important actions
        accent:
          "bg-accent text-accent-foreground shadow-lg hover:shadow-xl hover:bg-accent/90 active:scale-[0.98]",
        // Destructive/danger actions
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        // Outline button with hover fill
        outline:
          "border-2 border-border bg-transparent hover:bg-secondary hover:border-primary/30 active:scale-[0.98]",
        // Outline primary
        "outline-primary":
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 active:scale-[0.98]",
        // Glass button
        glass:
          "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20 hover:border-white/30 active:scale-[0.98]",
        // Secondary muted button
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]",
        // Ghost button (minimal)
        ghost:
          "hover:bg-secondary hover:text-foreground",
        // Link style
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 rounded-lg",
        sm: "h-9 px-4 text-xs rounded-md",
        lg: "h-12 px-7 text-base rounded-xl",
        xl: "h-14 px-10 text-lg rounded-xl",
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
