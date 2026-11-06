"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/15",
      secondary:
        "border border-white/[0.08] bg-surface-elevated text-foreground hover:bg-white/[0.04]",
      ghost:
        "text-muted hover:text-foreground hover:bg-white/[0.04]",
      danger:
        "border border-danger/20 bg-danger/5 text-danger hover:bg-danger/10 hover:text-danger",
      accent:
        "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/15",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-8 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...(props as any)}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
