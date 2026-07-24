"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  glow?: boolean;
  style?: CSSProperties;
}

export function GlassCard({
  children,
  className,
  hover = true,
  padding = "md",
  glow = false,
  style,
}: GlassCardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl border border-[rgba(169,149,255,0.12)] bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_12px_35px_rgba(0,0,0,.13)] relative overflow-hidden",
        paddings[padding],
        hover && "transition-all duration-300",
        glow && "glow",
        className
      )}
      style={style}
    >
      {children}
    </motion.div>
  );
}
