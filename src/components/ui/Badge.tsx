import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-[var(--primary)]/10 text-[var(--primary)]": variant === "default",
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": variant === "success",
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400": variant === "warning",
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": variant === "danger",
          "border border-[var(--border)] bg-transparent text-[var(--muted-foreground)]": variant === "outline",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
