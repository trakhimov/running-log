"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function NeuButton({
  children,
  variant = "default",
  size = "md",
  loading,
  className,
  disabled,
  ...props
}: NeuButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "font-semibold rounded-xl transition-all select-none",
        "neu-raised active:neu-inset",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-base",
        size === "lg" && "px-7 py-3.5 text-lg",
        variant === "accent" && "text-indigo-600",
        variant === "danger" && "text-red-500",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
