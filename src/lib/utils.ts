import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function parseBaserowValue<T>(
  value: T | { id: number; value: string } | null
): T | string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "value" in value) {
    return value.value;
  }
  return value;
}

export function parseBaserowId(
  value: number | { id: number; value: string } | null
): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && "id" in value) {
    return value.id;
  }
  return value;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    autopilot: "bg-blue-100 text-blue-800",
    generated: "bg-purple-100 text-purple-800",
    ready: "bg-yellow-100 text-yellow-800",
    publish: "bg-orange-100 text-orange-800",
    published: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
