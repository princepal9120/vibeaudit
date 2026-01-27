import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label?: string;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    const isPositive = trend && trend.value > 0;
    const isNegative = trend && trend.value < 0;

    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                isPositive && "text-green-600",
                                isNegative && "text-red-600",
                                !isPositive && !isNegative && "text-muted-foreground"
                            )}
                        >
                            {isPositive && "↑"} {isNegative && "↓"} {trend.value > 0 ? "+" : ""}
                            {trend.value}%
                        </span>
                        {trend.label && (
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
