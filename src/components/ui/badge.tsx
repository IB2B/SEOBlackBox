"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/30",
        secondary:
          "bg-muted text-muted-foreground border border-border/50",
        destructive:
          "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-500/30",
        outline:
          "border border-border/50 text-foreground bg-background/50",
        success:
          "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/30",
        warning:
          "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/30",
        error:
          "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-500/30",
        info:
          "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/30",
        purple:
          "bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/30",
      },
      size: {
        default: "px-2.5 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, size, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dotColor || "bg-current opacity-70"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
