"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { USER_EDITABLE_STATUSES } from "@/lib/constants";
import { ChevronDown, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { BlogStatus } from "@/types";

interface InlineStatusSelectProps {
  blogId: number;
  status: BlogStatus;
  onStatusChange?: (newStatus: BlogStatus) => void;
  disabled?: boolean;
}

// Status color mapping with semantic colors
const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "PARKING": {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-500",
  },
  "Auto Pilot": {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/50",
    dot: "bg-amber-500",
  },
  "PUBLISH": {
    bg: "bg-violet-50 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-700/50",
    dot: "bg-violet-500",
  },
  "COMPLETED": {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700/50",
    dot: "bg-emerald-500",
  },
  "WAIT": {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-700/50",
    dot: "bg-purple-500",
  },
};

const defaultColors = {
  bg: "bg-slate-100 dark:bg-slate-800/50",
  text: "text-slate-700 dark:text-slate-300",
  border: "border-slate-200 dark:border-slate-700",
  dot: "bg-slate-500",
};

export function InlineStatusSelect({
  blogId,
  status,
  onStatusChange,
  disabled = false,
}: InlineStatusSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState<BlogStatus>(status);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Check if current status is user-editable
  const isEditable = USER_EDITABLE_STATUSES.includes(currentStatus as typeof USER_EDITABLE_STATUSES[number]);

  const colors = statusColors[currentStatus] || defaultColors;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with prop changes
  React.useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const handleStatusChange = async (newStatus: BlogStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      const response = await fetch(`/api/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update status");
      }

      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      toast.success(`Status changed to ${newStatus}`);

      // Revalidate cache for dashboard/tracking data
      mutate("/api/tracking");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  // Non-editable status - just show badge
  if (!isEditable || disabled) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border",
          colors.bg,
          colors.text,
          colors.border
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
        {currentStatus}
      </span>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "group inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-200",
          colors.bg,
          colors.text,
          colors.border,
          "hover:shadow-sm cursor-pointer",
          isOpen && "ring-2 ring-violet-500/20",
          isLoading && "opacity-70 cursor-wait"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
        )}
        <span>{currentStatus}</span>
        {!isLoading && (
          <ChevronDown className={cn(
            "w-3 h-3 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 top-full mt-1 right-0 min-w-[140px]",
          "bg-background border border-border/50 rounded-lg shadow-lg",
          "py-1 overflow-hidden",
          "animate-in fade-in-0 slide-in-from-top-2 duration-150"
        )}>
          {USER_EDITABLE_STATUSES.map((statusOption) => {
            const optionColors = statusColors[statusOption] || defaultColors;
            const isSelected = statusOption === currentStatus;

            return (
              <button
                key={statusOption}
                type="button"
                onClick={() => handleStatusChange(statusOption as BlogStatus)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors",
                  "hover:bg-muted/50",
                  isSelected && "bg-violet-500/10"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", optionColors.dot)} />
                <span className={cn(
                  "flex-1",
                  isSelected && "text-violet-700 dark:text-violet-300"
                )}>
                  {statusOption}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-violet-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
