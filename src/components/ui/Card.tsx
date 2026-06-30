import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  accent?: "primary" | "success" | "warning" | "danger" | "info";
}

export function Card({ className, hover, glass, accent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow",
        hover && "premium-card cursor-pointer",
        glass && "glass",
        accent === "primary" && "metric-primary",
        accent === "success" && "metric-success",
        accent === "warning" && "metric-warning",
        accent === "danger"  && "metric-danger",
        accent === "info"    && "metric-info",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-[var(--foreground)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--muted-foreground)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

const ACCENT_CLASSES: Record<string, string> = {
  primary: "border-l-[var(--primary)] bg-gradient-to-br from-indigo-50/60 to-transparent dark:from-indigo-950/20",
  success: "border-l-emerald-500 bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/20",
  warning: "border-l-amber-500 bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-950/20",
  danger:  "border-l-red-500 bg-gradient-to-br from-red-50/60 to-transparent dark:from-red-950/20",
  info:    "border-l-blue-500 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-950/20",
};

export function MetricCard({
  label,
  value,
  subValue,
  icon,
  color,
  accent = "primary",
  trend,
  className,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon?: string;
  color?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "info";
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "";

  return (
    <div className={cn(
      "rounded-2xl border-l-[3px] border border-[var(--border)] bg-[var(--card)] p-5 premium-card card-shadow transition-all",
      ACCENT_CLASSES[accent],
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
        {icon && <span className="text-xl leading-none">{icon}</span>}
      </div>
      <p className={cn("text-2xl font-bold tracking-tight", color ?? (
        accent === "primary" ? "text-[var(--primary)]" :
        accent === "success" ? "text-emerald-600 dark:text-emerald-400" :
        accent === "warning" ? "text-amber-600 dark:text-amber-400" :
        accent === "danger"  ? "text-red-600 dark:text-red-400" :
        "text-blue-600 dark:text-blue-400"
      ))}>
        {value}
        {trendIcon && <span className={cn("ml-1 text-sm font-medium", trendColor)}>{trendIcon}</span>}
      </p>
      {subValue && <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{subValue}</p>}
    </div>
  );
}
