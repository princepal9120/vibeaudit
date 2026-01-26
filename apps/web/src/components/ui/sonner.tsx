"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <div aria-live="polite" aria-atomic="true">
            <Sonner
                className="toaster group"
                position="top-right"
                expand={true}
                richColors
                closeButton
                toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm group-[.toaster]:rounded-xl group-[.toaster]:p-4",
                    description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
                    actionButton:
                        "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:opacity-90 group-[.toast]:transition-opacity",
                    cancelButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:hover:bg-muted/80 group-[.toast]:transition-colors",
                    success:
                        "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50/90 group-[.toaster]:text-emerald-900",
                    error:
                        "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50/90 group-[.toaster]:text-red-900",
                    warning:
                        "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50/90 group-[.toaster]:text-amber-900",
                    info:
                        "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50/90 group-[.toaster]:text-blue-900",
                },
            }}
            {...props}
            />
        </div>
    )
}

export { Toaster }
