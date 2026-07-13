"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  padding = "md",
  glow = false,
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
        "glass rounded-2xl relative overflow-hidden",
        paddings[padding],
        hover &&
          "hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300",
        glow && "glow",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
