"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BlogPreviewEditable } from "@/components/blogs/BlogPreviewEditable";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { ROUTES } from "@/lib/constants";
import type { Blog, BlogStatus } from "@/types";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";

export default function ViewBlogPage() {
  const params = useParams();
  const blogId = Number(params.id);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.error || "Failed to load blog");
      }
    } catch (err) {
      setError("Failed to load blog");
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleSave = async (updatedBlog: Partial<Blog>, newStatus?: BlogStatus) => {
    setIsSaving(true);
    setError(null);

    const toastId = newStatus === "PUBLISH" ? "publish-blog" : "save-blog";
    toast.loading(newStatus === "PUBLISH" ? "Publishing..." : "Saving...", { id: toastId });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updatedBlog,
          STEPS: newStatus || blog?.STEPS,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBlog(data.data);
        if (newStatus === "PUBLISH") {
          toast.success("Blog sent for publishing!", { id: toastId });
        } else {
          toast.success("Blog saved successfully!", { id: toastId });
        }
      } else {
        toast.error(data.error || "Failed to save blog", { id: toastId });
        setError(data.error || "Failed to save blog");
      }
    } catch (err) {
      toast.error("Failed to save blog", { id: toastId });
      setError("Failed to save blog");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Blog not found"}</p>
        <Link href={ROUTES.BLOGS}>
          <Button>Back to Blogs</Button>
        </Link>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={ROUTES.BLOGS}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Preview & Edit</h1>
            <p className="text-muted-foreground">
              Keyword: {blog.Keywords} | Project: {blog.Project}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {blog.Created_At && (
            <span className="text-sm text-muted-foreground">
              {new Date(blog.Created_At).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
          <StatusBadge status={blog.STEPS} />
        </div>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <BlogPreviewEditable
        blog={blog}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
