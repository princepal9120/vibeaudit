import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
