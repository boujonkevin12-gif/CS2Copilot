import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}

export function GradientText({
  children,
  className,
  variant = "default",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        variant === "default" ? "gradient-text" : "gradient-text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
