import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "critical" | "high" | "medium" | "low" | "info" | "success" | "warning" | "default";
  size?: "sm" | "md" | "lg";
}

export default function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    critical: "bg-critical-light text-critical",
    high: "bg-high-light text-high",
    medium: "bg-medium-light text-medium",
    low: "bg-low-light text-low",
    info: "bg-info-light text-info",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    default: "bg-gray-100 text-gray-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
