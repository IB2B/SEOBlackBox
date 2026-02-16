"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative group">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl bg-muted/50 border border-border/50 px-4 py-2 pr-10 text-sm ring-offset-background focus:outline-none focus:border-primary/50 focus:bg-muted focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none p-1.5 rounded-lg bg-muted/80 group-focus-within:bg-primary/10 transition-colors">
          <ChevronDown className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
