"use client";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: React.ReactNode;
  className?: string;
}

const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-12 w-12 text-base",
};

export function Avatar({
  src,
  alt,
  size = "md",
  fallback,
  className,
  ...restProps
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0",
        sizes[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full rounded-full object-cover border border-white/[0.08]",
          )}
          {...restProps}
        />
      ) : (
        <div className="h-full w-full rounded-full bg-surface-elevated border border-white/[0.06] flex items-center justify-center text-muted font-medium">
          {fallback}
        </div>
      )}
    </div>
  );
}
