"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
