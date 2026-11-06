"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeUp?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeUp = true,
  icon,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-5", className)} padded={false}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {icon && (
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <p className="text-xs text-muted font-medium mt-1">{title}</p>
          {subtitle && <p className="text-[10px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-bold text-foreground">{value}</div>
          {change && (
            <p className={cn("text-xs font-medium mt-0.5", changeUp ? "text-success" : "text-danger")}>
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
