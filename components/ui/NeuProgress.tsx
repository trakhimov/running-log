import { cn } from "@/lib/utils";

interface NeuProgressProps {
  value: number; // 0–100
  label?: string;
  color?: string;
  className?: string;
  showValue?: boolean;
}

export function NeuProgress({
  value,
  label,
  color = "#6366f1",
  className,
  showValue,
}: NeuProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-neu-text-muted mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="h-3 rounded-full neu-inset overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            background: color,
            boxShadow: `2px 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
