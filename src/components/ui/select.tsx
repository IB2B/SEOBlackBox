"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "ghost" | "filled";
  selectSize?: "sm" | "md" | "lg";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, icon, variant = "default", selectSize = "md", ...props }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: "h-9 px-3 py-1.5 text-xs",
      md: "h-11 px-4 py-2.5 text-sm",
      lg: "h-12 px-4 py-3 text-sm",
    };

    // Variant classes
    const variantClasses = {
      default: cn(
        "border-border/50 bg-background/80",
        "hover:border-violet-400/50 hover:bg-background",
        "focus:border-violet-500 focus:bg-background"
      ),
      ghost: cn(
        "border-transparent bg-muted/50",
        "hover:bg-muted hover:border-border/30",
        "focus:bg-background focus:border-violet-500"
      ),
      filled: cn(
        "border-transparent bg-muted",
        "hover:bg-muted/80",
        "focus:bg-background focus:border-violet-500"
      ),
    };

    return (
      <div className="relative group">
        {icon && (
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-200",
            "text-muted-foreground/50 group-hover:text-muted-foreground group-focus-within:text-violet-500"
          )}>
            {icon}
          </div>
        )}
        <select
          className={cn(
            // Base styles
            "flex w-full appearance-none rounded-lg border font-medium transition-all duration-200 cursor-pointer",
            // Size
            sizeClasses[selectSize],
            // Right padding for chevron
            "pr-10",
            // Variant
            variantClasses[variant],
            // Focus ring
            "focus:outline-none focus:ring-2 focus:ring-violet-500/20",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border/50",
            // Error state
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400",
            // Icon padding
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron */}
        <div className={cn(
          "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
          "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
          "bg-muted/60 group-hover:bg-violet-500/10 group-focus-within:bg-violet-500/15"
        )}>
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-all duration-200",
            "text-muted-foreground group-hover:text-violet-600 group-focus-within:text-violet-500",
            "group-focus-within:rotate-180"
          )} />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
