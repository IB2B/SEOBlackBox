"use client";

import React, { useState, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Card } from "@/components/ui/card";
import type { Blog } from "@/types";
import { ROUTES } from "@/lib/constants";
import { truncate, cn } from "@/lib/utils";
import { Edit, Eye, Trash2, FileText, Plus, MoreVertical, Clock } from "lucide-react";

// Format date for display
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface BlogTableProps {
  blogs: Blog[];
  isLoading: boolean;
  onDelete: (blogId: number) => void;
  onPreview?: (blog: Blog) => void;
}

const BlogRow = memo(function BlogRow({ blog, onDelete, onPreview, index }: { blog: Blog; onDelete: (id: number) => void; onPreview?: (blog: Blog) => void; index: number }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-muted/50 animate-fade-in-up",
        index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Index/Number */}
      <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground">
        {index + 1}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
        {/* Keywords - Mobile: full width, Desktop: 3 cols */}
        <div className="md:col-span-3">
          <Link
            href={ROUTES.BLOG_VIEW(blog.id)}
            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {truncate(blog.Keywords, 30)}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5 md:hidden flex items-center gap-2">
            <span>{blog.Project}</span>
            {blog.Created_At && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(blog.Created_At)}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Title - 3 cols */}
        <div className="md:col-span-3 hidden md:block">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {truncate(blog.TITLE, 40) || (
              <span className="italic">No title yet</span>
            )}
          </p>
        </div>

        {/* Status - 2 cols */}
        <div className="md:col-span-2 flex items-center gap-2">
          <StatusBadge status={blog.STEPS} />
        </div>

        {/* Project - 2 cols */}
        <div className="md:col-span-2 hidden md:block">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-violet-500/50" />
            {truncate(blog.Project, 15)}
          </span>
        </div>

        {/* Date - 2 cols */}
        <div className="md:col-span-2 hidden lg:block">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(blog.Created_At)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Quick Actions - Always Visible */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPreview ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-primary/10 hover:text-primary"
              title="Quick Preview"
              onClick={() => onPreview(blog)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          ) : (
            <Link href={ROUTES.BLOG_VIEW(blog.id)}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-primary/10 hover:text-primary"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Link href={ROUTES.BLOG_EDIT(blog.id)}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-blue-500/10 hover:text-blue-500"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-red-500/10 hover:text-red-500"
            title="Delete"
            onClick={() => onDelete(blog.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Actions Menu */}
        <div className="relative sm:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border/50 rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                {onPreview ? (
                  <button
                    onClick={() => {
                      onPreview(blog);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Quick Preview
                  </button>
                ) : (
                  <Link
                    href={ROUTES.BLOG_VIEW(blog.id)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => setShowActions(false)}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                )}
                <Link
                  href={ROUTES.BLOG_EDIT(blog.id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setShowActions(false)}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    onDelete(blog.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// Display name for React DevTools
BlogRow.displayName = "BlogRow";

function LoadingSkeleton() {
  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-8 h-4 skeleton" />
          <div className="flex-1 grid grid-cols-12 gap-4">
            <div className="col-span-3 h-4 skeleton" />
            <div className="col-span-3 h-4 skeleton hidden md:block" />
            <div className="col-span-2 h-4 skeleton" />
            <div className="col-span-2 h-4 skeleton hidden md:block" />
            <div className="col-span-2 h-4 skeleton hidden lg:block" />
          </div>
          <div className="w-20 h-4 skeleton" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="hidden sm:block w-8 h-8 skeleton rounded-lg" />
            <div className="flex-1 grid grid-cols-12 gap-4">
              <div className="col-span-3 h-5 skeleton" />
              <div className="col-span-3 h-4 skeleton hidden md:block" />
              <div className="col-span-2 h-6 w-20 skeleton rounded-lg" />
              <div className="col-span-2 h-4 skeleton hidden md:block" />
              <div className="col-span-2 h-4 skeleton hidden lg:block" />
            </div>
            <div className="w-24 h-8 skeleton rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function BlogTable({ blogs, isLoading, onDelete, onPreview }: BlogTableProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (blogs.length === 0) {
    return (
      <Card variant="glass" className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 mb-4">
          <FileText className="w-8 h-8 text-violet-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Get started by creating your first blog post
        </p>
        <Link href={ROUTES.BLOG_NEW}>
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Add Blog
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:block px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="w-8 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            #
          </div>
          <div className="flex-1 grid grid-cols-12 gap-4">
            <div className="col-span-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Keywords
            </div>
            <div className="col-span-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title
            </div>
            <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </div>
            <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Project
            </div>
            <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:block">
              Created
            </div>
          </div>
          <div className="w-24 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Actions
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/30">
        {blogs.map((blog, index) => (
          <BlogRow key={blog.id} blog={blog} onDelete={onDelete} onPreview={onPreview} index={index} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Showing {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Card>
  );
}
