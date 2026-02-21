import { cn } from "@/lib/utils";

interface NeuSkeletonProps {
  className?: string;
}

export function NeuSkeleton({ className }: NeuSkeletonProps) {
  return (
    <div
      className={cn(
        "neu-inset rounded-xl animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent",
        className
      )}
    />
  );
}
