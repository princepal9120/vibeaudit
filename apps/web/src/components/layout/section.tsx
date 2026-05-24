import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    container?: "default" | "narrow" | "none";
}

export function Section({
    children,
    className,
    container = "default",
    ...props
}: SectionProps) {
    return (
        <section
            className={cn("py-16 lg:py-20 px-6", className)}
            {...props}
        >
            {container !== "none" && (
                <div className={cn(
                    container === "default" ? "container" : "container-narrow"
                )}>
                    {children}
                </div>
            )}
            {container === "none" && children}
        </section>
    );
}

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "narrow";
}

export function Container({
    children,
    className,
    variant = "default",
    ...props
}: ContainerProps) {
    return (
        <div
            className={cn(
                variant === "default" ? "container" : "container-narrow",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
