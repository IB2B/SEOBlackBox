"use client";

import { useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationContext } from "./NotificationProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationToggle({ className, showLabel = false }: NotificationToggleProps) {
  const { isSupported, permission, isEnabled, enableNotifications, disableNotifications } =
    useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isEnabled) {
      disableNotifications();
      toast.success("Notifications disabled");
    } else {
      setIsLoading(true);
      try {
        const success = await enableNotifications();
        if (success) {
          toast.success("Notifications enabled! You'll be notified when blogs are ready.");
        } else if (permission === "denied") {
          toast.error("Notification permission denied. Please enable in browser settings.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const Icon = isEnabled ? BellRing : permission === "denied" ? BellOff : Bell;

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      onClick={handleToggle}
      disabled={isLoading || permission === "denied"}
      className={cn(
        "relative",
        isEnabled && "text-violet-600 dark:text-violet-400",
        permission === "denied" && "opacity-50",
        className
      )}
      title={
        permission === "denied"
          ? "Notifications blocked in browser"
          : isEnabled
          ? "Disable notifications"
          : "Enable notifications"
      }
    >
      <Icon className={cn("w-5 h-5", isEnabled && "animate-pulse")} />
      {showLabel && (
        <span className="ml-2">
          {isEnabled ? "Notifications On" : "Notifications Off"}
        </span>
      )}
      {isEnabled && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
      )}
    </Button>
  );
}
