"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ChartContainer({
  children,
  title,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn("p-5", className)} padded={false}>
      {title && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="relative w-full h-64">{children}</div>
    </Card>
  );
}
