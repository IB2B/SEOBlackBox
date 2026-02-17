"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useTracking } from "@/hooks/useSWR";
import type { Blog, BlogStatus } from "@/types";

// Minimal blog type that matches SlimBlog from tracking API
type SlimBlog = {
  id: number;
  TITLE?: string | null;
  Keywords?: string | null;
  STEPS: BlogStatus;
};

interface NotificationContextValue {
  isSupported: boolean;
  permission: "granted" | "denied" | "default";
  isEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    isSupported,
    permission,
    isEnabled,
    enableNotifications,
    disableNotifications,
    checkBlogsForNotifications,
  } = useNotifications();

  // Get tracking data to monitor blog status changes
  const { data: trackingData } = useTracking();

  // Keep track of previous blog states
  const previousBlogsRef = useRef<Map<number, SlimBlog>>(new Map());

  // Monitor blog status changes
  useEffect(() => {
    if (!trackingData || !isEnabled) return;

    // Collect all blogs from tracking data (these are SlimBlog types)
    const allBlogs: SlimBlog[] = [
      ...(trackingData.todayBlogs || []),
      ...(trackingData.yesterdayBlogs || []),
    ] as SlimBlog[];

    // Check for notifications
    checkBlogsForNotifications(allBlogs, previousBlogsRef.current);

    // Update previous blogs map
    const newMap = new Map<number, SlimBlog>();
    for (const blog of allBlogs) {
      newMap.set(blog.id, blog);
    }
    previousBlogsRef.current = newMap;
  }, [trackingData, isEnabled, checkBlogsForNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        permission,
        isEnabled,
        enableNotifications,
        disableNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
