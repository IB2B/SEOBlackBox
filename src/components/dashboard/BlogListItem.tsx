"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InlineStatusSelect } from "@/components/blogs/InlineStatusSelect";
import { ROUTES } from "@/lib/constants";
import { Eye, Edit2, Clock } from "lucide-react";
import type { Blog, BlogStatus } from "@/types";

// Slim blog type - only fields needed for list display (from optimized API)
type SlimBlog = Pick<Blog, "id" | "Keywords" | "TITLE" | "Project" | "STEPS" | "Language" | "Created_At">;

// Format date helper
function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface BlogListItemProps {
  blog: SlimBlog;
  index?: number;
  onStatusChange?: (blogId: number, newStatus: BlogStatus) => void;
  showIndex?: boolean;
}

export function BlogListItem({
  blog,
  index,
  onStatusChange,
  showIndex = true,
}: BlogListItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group">
      {/* Index Number */}
      {showIndex && index !== undefined && (
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold text-xs shrink-0">
          {index + 1}
        </div>
      )}

      {/* Blog Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {blog.TITLE || blog.Keywords}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {blog.Project}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span className="text-xs text-muted-foreground">
            {blog.Language}
          </span>
        </div>
      </div>

      {/* Date */}
      {blog.Created_At && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Clock className="w-3 h-3" />
          <span>{formatDate(blog.Created_At)}</span>
        </div>
      )}

      {/* Status Dropdown */}
      <InlineStatusSelect
        blogId={blog.id}
        status={blog.STEPS}
        onStatusChange={(newStatus) => onStatusChange?.(blog.id, newStatus)}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={ROUTES.BLOG_VIEW(blog.id)}>
          <Button variant="ghost" size="icon-sm" title="View Details">
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
        <Link href={ROUTES.BLOG_EDIT(blog.id)}>
          <Button variant="ghost" size="icon-sm" title="Edit Blog">
            <Edit2 className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Empty state component
export function BlogListEmpty({ message = "No blogs found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Edit2 className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading skeleton
export function BlogListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border animate-pulse"
        >
          <div className="w-7 h-7 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}
