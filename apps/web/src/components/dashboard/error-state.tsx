import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
    title?: string;
    message: string;
    retry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Something went wrong",
    message,
    retry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center",
                className
            )}
        >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">{message}</p>
            {retry && (
                <Button onClick={retry} variant="outline" className="mt-6">
                    Try Again
                </Button>
            )}
        </div>
    );
}
