import { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NeuCardProps {
  children: ReactNode;
  className?: string;
  inset?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function NeuCard({ children, className, inset, onClick, style }: NeuCardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "rounded-2xl p-4 transition-all",
        inset
          ? "neu-inset"
          : "neu-raised",
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}
