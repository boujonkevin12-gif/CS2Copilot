"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  width = "100%",
  height = "1em",
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-elevated",
        typeof width === "number" ? `w-[${width}px]` : `w-[${width}]`,
        typeof height === "number" ? `h-[${height}px]` : `h-[${height}]`,
        className,
      )}
    />
  );
}
