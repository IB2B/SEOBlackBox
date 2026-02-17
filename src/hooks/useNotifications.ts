"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBlogReadyNotification,
  sendBlogPublishedNotification,
  type NotificationPermission,
} from "@/lib/notifications";
import { ROUTES } from "@/lib/constants";
import type { Blog, BlogStatus } from "@/types";

// Minimal blog type for notifications (works with SlimBlog from tracking API)
type NotifiableBlog = {
  id: number;
  TITLE?: string | null;
  Keywords?: string | null;
  STEPS: BlogStatus;
};

// Local storage key for notification settings
const NOTIFICATION_ENABLED_KEY = "seoBlackBox_notificationsEnabled";
const NOTIFIED_BLOGS_KEY = "seoBlackBox_notifiedBlogs";

// Statuses that trigger "ready to publish" notification
const READY_STATUSES: BlogStatus[] = ["COMPLETED"];

export function useNotifications() {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const notifiedBlogsRef = useRef<Set<string>>(new Set());

  // Initialize on mount
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(getNotificationPermission());

      // Load enabled state from localStorage
      const stored = localStorage.getItem(NOTIFICATION_ENABLED_KEY);
      setIsEnabled(stored === "true");

      // Load already notified blogs
      const notifiedStored = localStorage.getItem(NOTIFIED_BLOGS_KEY);
      if (notifiedStored) {
        try {
          const parsed = JSON.parse(notifiedStored);
          notifiedBlogsRef.current = new Set(parsed);
        } catch {
          notifiedBlogsRef.current = new Set();
        }
      }
    }
  }, []);

  // Request permission and enable notifications
  const enableNotifications = useCallback(async () => {
    if (!isSupported) return false;

    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);

    if (newPermission === "granted") {
      setIsEnabled(true);
      localStorage.setItem(NOTIFICATION_ENABLED_KEY, "true");
      return true;
    }

    return false;
  }, [isSupported]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    setIsEnabled(false);
    localStorage.setItem(NOTIFICATION_ENABLED_KEY, "false");
  }, []);

  // Save notified blogs to localStorage
  const saveNotifiedBlogs = useCallback(() => {
    const blogsArray = Array.from(notifiedBlogsRef.current);
    // Keep only last 100 entries to prevent storage bloat
    const trimmed = blogsArray.slice(-100);
    localStorage.setItem(NOTIFIED_BLOGS_KEY, JSON.stringify(trimmed));
  }, []);

  // Check if we should notify for a blog status change
  const checkAndNotify = useCallback(
    (blog: NotifiableBlog, previousStatus?: BlogStatus) => {
      if (!isEnabled || permission !== "granted") return;

      const notificationKey = `${blog.id}-${blog.STEPS}`;

      // Skip if already notified for this blog+status combo
      if (notifiedBlogsRef.current.has(notificationKey)) return;

      // Check if blog became "ready to publish"
      const isNowReady = READY_STATUSES.includes(blog.STEPS);
      const wasNotReady = previousStatus && !READY_STATUSES.includes(previousStatus);

      if (isNowReady && (wasNotReady || !previousStatus)) {
        const title = blog.TITLE || blog.Keywords || "Untitled Blog";
        sendBlogReadyNotification(title, blog.id, (blogId) => {
          router.push(ROUTES.BLOG_EDIT(blogId));
        });

        notifiedBlogsRef.current.add(notificationKey);
        saveNotifiedBlogs();
      }

      // Check if blog was published
      if (blog.STEPS === "PUBLISH" && previousStatus !== "PUBLISH") {
        const pubKey = `${blog.id}-published`;
        if (!notifiedBlogsRef.current.has(pubKey)) {
          const title = blog.TITLE || blog.Keywords || "Untitled Blog";
          sendBlogPublishedNotification(title, blog.id);
          notifiedBlogsRef.current.add(pubKey);
          saveNotifiedBlogs();
        }
      }
    },
    [isEnabled, permission, router, saveNotifiedBlogs]
  );

  // Batch check multiple blogs for status changes
  const checkBlogsForNotifications = useCallback(
    (blogs: NotifiableBlog[], previousBlogsMap?: Map<number, NotifiableBlog>) => {
      if (!isEnabled || permission !== "granted") return;

      for (const blog of blogs) {
        const prevBlog = previousBlogsMap?.get(blog.id);
        checkAndNotify(blog, prevBlog?.STEPS);
      }
    },
    [isEnabled, permission, checkAndNotify]
  );

  return {
    isSupported,
    permission,
    isEnabled,
    enableNotifications,
    disableNotifications,
    checkAndNotify,
    checkBlogsForNotifications,
  };
}
