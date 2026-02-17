"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: boolean;
  checkboxSize?: "sm" | "md" | "lg";
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, checkboxSize = "md", id, checked, defaultChecked, onChange, ...props }, ref) => {
    const checkboxId = id || React.useId();

    // Internal state for uncontrolled mode
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);

    // Use controlled value if provided, otherwise internal state
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    // Size classes
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const iconSizes = {
      sm: "w-2.5 h-2.5",
      md: "w-3 h-3",
      lg: "w-3.5 h-3.5",
    };

    const labelSizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center shrink-0">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={isChecked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />
          {/* Custom checkbox visual */}
          <label
            htmlFor={checkboxId}
            className={cn(
              // Base
              "flex items-center justify-center rounded-md border-2 transition-all duration-200 cursor-pointer",
              // Size
              sizeClasses[checkboxSize],
              // Default state
              !isChecked && "border-border/60 bg-background/80 hover:border-violet-400/50 hover:bg-violet-500/5",
              // Checked state
              isChecked && "border-violet-500 bg-violet-500",
              // Focus
              "peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/20 peer-focus-visible:ring-offset-1",
              // Disabled
              props.disabled && "opacity-50 cursor-not-allowed hover:border-border/60 hover:bg-background/80",
              // Error
              error && !isChecked && "border-red-400",
              error && isChecked && "border-red-500 bg-red-500"
            )}
          >
            <Check
              className={cn(
                iconSizes[checkboxSize],
                "text-white transition-all duration-150",
                isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50"
              )}
              strokeWidth={3}
            />
          </label>
        </div>
        {(label || description) && (
          <div className="flex-1 min-w-0 pt-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "block font-medium cursor-pointer select-none",
                  labelSizes[checkboxSize],
                  props.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
