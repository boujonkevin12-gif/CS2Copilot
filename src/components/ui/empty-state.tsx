"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-10 text-center", className)}>
      {icon && (
        <div className="h-16 w-16 rounded-xl bg-surface-elevated border border-white/[0.06] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-display font-bold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
