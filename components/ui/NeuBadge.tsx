import { RUN_TYPE_COLORS, RUN_TYPE_LABELS, RunType } from "@/lib/metrics/runType";
import { cn } from "@/lib/utils";

interface NeuBadgeProps {
  type: RunType | string;
  className?: string;
}

export function NeuBadge({ type, className }: NeuBadgeProps) {
  const runType = type as RunType;
  const color = RUN_TYPE_COLORS[runType] ?? "#9ca3af";
  const label = RUN_TYPE_LABELS[runType] ?? type;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]",
        className
      )}
      style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}
