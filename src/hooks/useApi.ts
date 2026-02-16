"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiOptions<T> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  immediate?: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (overrideBody?: unknown) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>({
  url,
  method = "GET",
  body,
  immediate = true,
}: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (overrideBody?: unknown): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const requestBody = overrideBody ?? body;
        const response = await fetch(url, {
          method,
          headers,
          body: requestBody ? JSON.stringify(requestBody) : undefined,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || `Request failed: ${response.status}`);
        }

        setData(result.data);
        return result.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, body]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate && method === "GET") {
      execute();
    }
  }, [immediate, method, execute]);

  return { data, isLoading, error, execute, reset };
}

// Specific hooks for common operations
export function useStats() {
  return useApi<import("@/types").DashboardStats>({
    url: "/api/stats",
    immediate: true,
  });
}

export function useBlogs(params?: {
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.size) searchParams.set("size", params.size.toString());

  const query = searchParams.toString();
  const url = `/api/blogs${query ? `?${query}` : ""}`;

  return useApi<{
    blogs: import("@/types").Blog[];
    pagination: {
      count: number;
      page: number;
      size: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>({
    url,
    immediate: true,
  });
}

export function useBlog(id: number) {
  return useApi<import("@/types").Blog>({
    url: `/api/blogs/${id}`,
    immediate: true,
  });
}

export function useProjects() {
  return useApi<string[]>({
    url: "/api/projects",
    immediate: true,
  });
}

export function useRecentBlogs(limit: number = 10) {
  return useApi<import("@/types").Blog[]>({
    url: `/api/blogs/recent?limit=${limit}`,
    immediate: true,
  });
}

export function useTracking() {
  return useApi<{
    projects: Array<{
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
      recentBlogs: import("@/types").Blog[];
    }>;
    totals: {
      totalBlogs: number;
      totalProjects: number;
      totalCompleted: number;
      totalAutoPilot: number;
      totalPublish: number;
      totalInProgress: number;
      totalParking: number;
      // Date-based tracking
      totalToday: number;
      totalYesterday: number;
      totalThisWeek: number;
      totalThisMonth: number;
    };
    todayBlogs: import("@/types").Blog[];
    lastUpdated: string;
  }>({
    url: "/api/tracking",
    immediate: true,
  });
}
