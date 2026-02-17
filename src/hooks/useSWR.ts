"use client";

import useSWR, { SWRConfiguration } from "swr";
import type { Blog, BlogStatus } from "@/types";

// Global fetcher with auth (HttpOnly cookie sent automatically via credentials: include)
async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Request failed");
  }

  return result.data;
}

// Default SWR config for all hooks
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch when tab gains focus
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 2,
};

// Slim blog type - only fields returned by optimized API
type SlimBlog = Pick<Blog, "id" | "Keywords" | "TITLE" | "Project" | "STEPS" | "Language" | "Created_At">;

// Types
interface TrackingTotals {
  totalBlogs: number;
  totalProjects: number;
  totalCompleted: number;
  totalAutoPilot: number;
  totalPublish: number;
  totalInProgress: number;
  totalParking: number;
  totalToday: number;
  totalYesterday: number;
  totalThisWeek: number;
  totalThisMonth: number;
}

interface ProjectSummary {
  name: string;
  total: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  completed: number;
  autoPilot: number;
  publish: number;
  inProgress: number;
  parking: number;
  recentBlogs: SlimBlog[];
}

interface TrackingData {
  projects: ProjectSummary[];
  totals: TrackingTotals;
  todayBlogs: SlimBlog[];
  yesterdayBlogs: SlimBlog[];
  thisWeekBlogs: SlimBlog[];
  thisMonthBlogs: SlimBlog[];
  lastUpdated: string;
}

interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    count: number;
    page: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============ HOOKS ============

/**
 * Fetch tracking/dashboard data with SWR caching
 * - Caches for 30 seconds
 * - Dedupes requests
 * - Auto revalidates in background
 */
export function useTracking() {
  const { data, error, isLoading, mutate } = useSWR<TrackingData>(
    "/api/tracking",
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 30000, // Refresh every 30 seconds (not 3s!)
      dedupingInterval: 10000, // Dedupe for 10 seconds
    }
  );

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

/**
 * Fetch blogs list with SWR caching
 */
export function useBlogs(params?: {
  status?: string;
  project?: string;
  search?: string;
  dateFilter?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.project) searchParams.set("project", params.project);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.dateFilter) searchParams.set("dateFilter", params.dateFilter);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.size) searchParams.set("size", params.size.toString());

  const query = searchParams.toString();
  const url = `/api/blogs${query ? `?${query}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<BlogsResponse>(
    url,
    fetcher,
    {
      ...defaultConfig,
      keepPreviousData: true, // Keep showing old data while loading new
    }
  );

  return {
    data: data || null,
    blogs: data?.blogs || [],
    pagination: data?.pagination || null,
    isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

/**
 * Fetch single blog with SWR caching
 */
export function useBlog(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Blog>(
    id ? `/api/blogs/${id}` : null,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 0, // Don't auto-refresh single blogs
    }
  );

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch: () => mutate(),
  };
}

/**
 * Fetch projects list with SWR caching
 */
export function useProjects() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/projects",
    fetcher,
    {
      ...defaultConfig,
      revalidateOnFocus: false,
      refreshInterval: 60000, // Projects don't change often
    }
  );

  return {
    data: data || [],
    isLoading,
    error: error?.message || null,
  };
}

/**
 * Update blog status - with cache invalidation
 */
export async function updateBlogStatus(
  blogId: number,
  newStatus: BlogStatus
): Promise<{ success: boolean; error?: string }> {
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
    return { success: result.success, error: result.error };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/**
 * Mutate/invalidate cache for specific keys
 */
export { mutate } from "swr";
