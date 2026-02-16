"use client";

import { cn } from "@/lib/utils";
import type { BlogStatus } from "@/types";
import { Loader2, CheckCircle2, Circle, Zap } from "lucide-react";

// Generation steps in order
const GENERATION_STEPS: { step: BlogStatus; label: string }[] = [
  { step: "Auto Pilot", label: "Queue" },
  { step: "SERP", label: "SERP" },
  { step: "Title", label: "Title" },
  { step: "Permalink", label: "URL" },
  { step: "Meta Description", label: "Meta" },
  { step: "Introduction", label: "Intro" },
  { step: "TOC", label: "TOC" },
  { step: "TL;DR", label: "TL;DR" },
  { step: "Conclusion", label: "End" },
  { step: "Full", label: "Full" },
];

// All possible generation steps for checking
const GENERATION_STEP_NAMES = GENERATION_STEPS.map(s => s.step);

interface GenerationProgressProps {
  currentStep: BlogStatus;
  isGenerating: boolean;
  isConnected?: boolean;
}

export function GenerationProgress({
  currentStep,
  isGenerating,
  isConnected = true,
}: GenerationProgressProps) {
  const currentIndex = GENERATION_STEPS.findIndex((s) => s.step === currentStep);

  // Check if current step is a generation step (even if isGenerating flag is false)
  const isGenerationStep = GENERATION_STEP_NAMES.includes(currentStep);

  const progress =
    currentIndex >= 0
      ? ((currentIndex + 1) / GENERATION_STEPS.length) * 100
      : 0;

  // Show during active generation OR when current step is a generation step
  if (!isGenerating && !isGenerationStep) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20 p-5">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-shimmer" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-violet-900 dark:text-violet-100">
                n8n is generating content
              </h3>
              <p className="text-sm text-violet-700 dark:text-violet-300">
                Current step: <span className="font-medium">{currentStep}</span>
              </p>
            </div>
          </div>

          {/* Connection status */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              isConnected
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/20 text-red-700 dark:text-red-300"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )}
            />
            {isConnected ? "Live" : "Reconnecting..."}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 bg-violet-200/50 dark:bg-violet-800/30 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Animated shine */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/3 animate-shimmer"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between gap-1">
          {GENERATION_STEPS.map((item, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={item.step}
                className={cn(
                  "flex flex-col items-center gap-1 flex-1",
                  "transition-all duration-300"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete &&
                      "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    isCurrent &&
                      "bg-violet-500 text-white shadow-lg shadow-violet-500/30 animate-pulse",
                    !isComplete &&
                      !isCurrent &&
                      "bg-violet-200/50 dark:bg-violet-800/30 text-violet-400"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isComplete && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && "text-violet-600 dark:text-violet-400",
                    !isComplete &&
                      !isCurrent &&
                      "text-violet-400 dark:text-violet-500"
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress percentage */}
        <div className="flex justify-center">
          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>
    </div>
  );
}
