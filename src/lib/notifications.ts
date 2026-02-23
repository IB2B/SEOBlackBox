/**
 * Browser Push Notification utilities
 */

export type NotificationPermission = "granted" | "denied" | "default";

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    // Notifications not supported in this browser
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    // Permission request failed
    return "denied";
  }
}

/**
 * Send a browser notification
 */
export function sendNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
    requireInteraction?: boolean;
  }
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/favicon.ico",
      tag: options?.tag,
      requireInteraction: options?.requireInteraction || false,
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    // Auto-close after 10 seconds if not clicked
    setTimeout(() => notification.close(), 10000);

    return notification;
  } catch (error) {
    // Notification send failed
    return null;
  }
}

/**
 * Send a blog ready notification
 */
export function sendBlogReadyNotification(
  blogTitle: string,
  blogId: number,
  onNavigate?: (blogId: number) => void
): Notification | null {
  return sendNotification("Blog Ready to Publish!", {
    body: `"${blogTitle}" is ready for review and publishing.`,
    tag: `blog-ready-${blogId}`,
    requireInteraction: true,
    onClick: () => {
      if (onNavigate) {
        onNavigate(blogId);
      }
    },
  });
}

/**
 * Send a blog published notification
 */
export function sendBlogPublishedNotification(
  blogTitle: string,
  blogId: number
): Notification | null {
  return sendNotification("Blog Published!", {
    body: `"${blogTitle}" has been published successfully.`,
    tag: `blog-published-${blogId}`,
  });
}

/**
 * Send a blog updated notification (on user save)
 */
export function sendBlogUpdatedNotification(
  blogTitle: string,
  blogId: number,
  changedFieldLabels: string[],
  onNavigate?: (blogId: number) => void
): Notification | null {
  const fieldSummary = changedFieldLabels.slice(0, 3).join(", ");
  const moreCount = changedFieldLabels.length > 3
    ? ` +${changedFieldLabels.length - 3} more`
    : "";

  return sendNotification("Blog Updated", {
    body: `${fieldSummary}${moreCount} changed in "${blogTitle}"`,
    onClick: () => {
      if (onNavigate) {
        onNavigate(blogId);
      }
    },
  });
}

/**
 * Send a blog error notification
 */
export function sendBlogErrorNotification(
  blogTitle: string,
  errorMessage?: string
): Notification | null {
  return sendNotification("Blog Generation Error", {
    body: errorMessage || `There was an issue generating "${blogTitle}".`,
    requireInteraction: true,
  });
}
