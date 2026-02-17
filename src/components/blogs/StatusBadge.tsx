"use client";

import { cn } from "@/lib/utils";
import type { BlogStatus } from "@/types";

interface StatusBadgeProps {
  status: BlogStatus;
  size?: "sm" | "default";
}

// Semantic color mapping with dark mode support
const statusConfig: Record<string, { bg: string; text: string; border: string; dot?: string }> = {
  // Neutral - Waiting for action
  "PARKING": {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-500",
  },
  // Processing - Active automation
  "Auto Pilot": {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/50",
    dot: "bg-amber-500 animate-pulse",
  },
  // Generation steps - Sky/Blue tones
  "SERP": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Title": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Permalink": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Meta Description": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Introduction": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "TOC": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "TL;DR": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Conclusion": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  "Full": {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot: "bg-sky-500 animate-pulse",
  },
  // Ready to publish - Brand color (Violet)
  "PUBLISH": {
    bg: "bg-violet-50 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-700/50",
    dot: "bg-violet-500",
  },
  // Completed - Success (Emerald)
  "COMPLETED": {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700/50",
    dot: "bg-emerald-500",
  },
  // On hold - Purple
  "WAIT": {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-700/50",
    dot: "bg-purple-500",
  },
};

// Default fallback
const defaultConfig = {
  bg: "bg-slate-100 dark:bg-slate-800/50",
  text: "text-slate-700 dark:text-slate-300",
  border: "border-slate-200 dark:border-slate-700",
  dot: "bg-slate-500",
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {config.dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      )}
      {status}
    </span>
  );
}
