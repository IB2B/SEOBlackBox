"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Blog, BlogStatus } from "@/types";

// Steps that indicate active generation
const ACTIVE_GENERATION_STEPS: BlogStatus[] = [
  "Auto Pilot",
  "SERP",
  "Title",
  "Permalink",
  "Meta Description",
  "Introduction",
  "TOC",
  "TL;DR",
  "Conclusion",
  "Full",
];

// Fields to track for content changes
const TRACKED_FIELDS = [
  "TITLE",
  "Permalink",
  "META DESC",
  "INTRODUCTION",
  "CONCLUSION",
  "TL;DR",
  "Section 1",
  "Section 2",
  "Section 3",
  "Section 4",
  "Section 5",
  "Section 6",
  "Section 7",
  "FAQ",
  "images URL",
  "image 1",
  "image 3",
  "Article Category",
] as const;

type TrackedField = (typeof TRACKED_FIELDS)[number];

// Get changed fields between two blog objects
function getChangedFields(prev: Blog | null, next: Blog): TrackedField[] {
  if (!prev) return [...TRACKED_FIELDS];

  const changed: TrackedField[] = [];
  for (const field of TRACKED_FIELDS) {
    const prevVal = prev[field as keyof Blog];
    const nextVal = next[field as keyof Blog];
    if (prevVal !== nextVal) {
      changed.push(field);
    }
  }
  return changed;
}

interface UseBlogStreamOptions {
  blogId: number;
  enabled?: boolean;
  pollingInterval?: number; // in ms, default 3000
  onUpdate?: (blog: Blog, prevStep: BlogStatus | null, changedFields: TrackedField[]) => void;
}

interface UseBlogStreamReturn {
  blog: Blog | null;
  isConnected: boolean;
  isGenerating: boolean;
  currentStep: BlogStatus | null;
  error: string | null;
  refetch: () => void;
}

export function useBlogStream({
  blogId,
  enabled = true,
  pollingInterval = 3000,
  onUpdate,
}: UseBlogStreamOptions): UseBlogStreamReturn {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<BlogStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevStepRef = useRef<BlogStatus | null>(null);
  const prevBlogRef = useRef<Blog | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep onUpdate ref current
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const fetchBlog = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const fetchedBlog = data.data as Blog;
        const newStep = fetchedBlog.STEPS;
        const generating = ACTIVE_GENERATION_STEPS.includes(newStep);

        // Check if this is the initial load (no previous data)
        const isInitialLoad = prevBlogRef.current === null;

        // Detect which fields changed (only if not initial load)
        const changedFields = isInitialLoad ? [] : getChangedFields(prevBlogRef.current, fetchedBlog);
        const stepChanged = prevStepRef.current !== null && prevStepRef.current !== newStep;

        setBlog(fetchedBlog);
        setCurrentStep(newStep);
        setIsGenerating(generating);
        setIsConnected(true);
        setError(null);

        // Only call onUpdate for real changes (skip initial load)
        if (!isInitialLoad && (stepChanged || changedFields.length > 0)) {
          onUpdateRef.current?.(fetchedBlog, prevStepRef.current, changedFields);
        }

        prevStepRef.current = newStep;
        prevBlogRef.current = fetchedBlog;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Polling failed");
      setIsConnected(false);
    }
  }, [blogId, enabled]);

  // Start polling
  useEffect(() => {
    if (!enabled || isNaN(blogId)) return;

    // Initial fetch
    fetchBlog();

    // Set up polling interval
    intervalRef.current = setInterval(fetchBlog, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [blogId, enabled, pollingInterval, fetchBlog]);

  const refetch = useCallback(() => {
    fetchBlog();
  }, [fetchBlog]);

  return {
    blog,
    isConnected,
    isGenerating,
    currentStep,
    error,
    refetch,
  };
}
