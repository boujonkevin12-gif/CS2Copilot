"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "accent" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-surface-elevated text-foreground-secondary border border-white/[0.06]",
    success: "bg-success/10 text-success border-success/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    warning: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-primary/10 text-primary border-primary/20",
    info: "bg-info/10 text-info border-info/20",
    outline: "border border-white/[0.08] bg-transparent text-foreground-secondary",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
