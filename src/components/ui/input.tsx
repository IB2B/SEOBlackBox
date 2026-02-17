"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean;
  variant?: "default" | "ghost" | "filled";
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, suffix, error, variant = "default", inputSize = "md", ...props }, ref) => {
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

    const inputClasses = cn(
      // Base styles
      "flex w-full rounded-lg border font-medium transition-all duration-200",
      // Size
      sizeClasses[inputSize],
      // Variant
      variantClasses[variant],
      // Focus ring
      "focus:outline-none focus:ring-2 focus:ring-violet-500/20",
      // Placeholder
      "placeholder:text-muted-foreground/50 placeholder:font-normal",
      // File input
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border/50",
      // Error state
      error && "border-red-400 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400",
      // Icon padding
      icon && "pl-10",
      suffix && "pr-10",
      className
    );

    if (icon || suffix) {
      return (
        <div className="relative group">
          {icon && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
              "text-muted-foreground/50 group-hover:text-muted-foreground group-focus-within:text-violet-500"
            )}>
              {icon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
              "text-muted-foreground/60 group-focus-within:text-violet-500"
            )}>
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
