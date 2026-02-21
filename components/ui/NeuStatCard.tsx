import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NeuStatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  trendPositive?: boolean; // true if "up" is good
  className?: string;
  icon?: ReactNode;
}

export function NeuStatCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  trendPositive = true,
  className,
  icon,
}: NeuStatCardProps) {
  const trendColor =
    trend === "neutral"
      ? "text-neu-text-muted"
      : trend === "up"
      ? trendPositive
        ? "text-emerald-500"
        : "text-red-500"
      : trendPositive
      ? "text-red-500"
      : "text-emerald-500";

  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className={cn("neu-raised rounded-2xl p-4", className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-neu-text-muted uppercase tracking-wide">
          {label}
        </p>
        {icon && <span className="text-neu-text-muted">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-neu-text">{value}</span>
        {unit && (
          <span className="text-sm text-neu-text-muted">{unit}</span>
        )}
      </div>
      {trend && trendLabel && (
        <div className={cn("mt-1 text-xs font-medium flex items-center gap-0.5", trendColor)}>
          <span>{trendArrow}</span>
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
