"use client";

import { Badge } from "@/components/ui/badge";
import type { BlogStatus } from "@/types";

interface StatusBadgeProps {
  status: BlogStatus;
}

const statusColors: Record<string, string> = {
  "PARKING": "bg-red-100 text-red-800",
  "Auto Pilot": "bg-gray-100 text-gray-800",
  "SERP": "bg-green-100 text-green-800",
  "Title": "bg-yellow-100 text-yellow-800",
  "Permalink": "bg-orange-100 text-orange-800",
  "Meta Description": "bg-blue-100 text-blue-800",
  "Introduction": "bg-red-100 text-red-700",
  "TOC": "bg-purple-100 text-purple-800",
  "TL;DR": "bg-cyan-100 text-cyan-800",
  "Conclusion": "bg-gray-200 text-gray-700",
  "Full": "bg-blue-200 text-blue-800",
  "PUBLISH": "bg-pink-100 text-pink-800",
  "COMPLETED": "bg-green-200 text-green-800",
  "Positive": "bg-green-100 text-green-700",
  "Neutral": "bg-yellow-100 text-yellow-700",
  "Negative": "bg-red-100 text-red-700",
  "WAIT": "bg-purple-100 text-purple-700",
  "ATOMA": "bg-blue-100 text-blue-700",
  "HARLOCK": "bg-cyan-100 text-cyan-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <Badge className={colorClass}>
      {status}
    </Badge>
  );
}
