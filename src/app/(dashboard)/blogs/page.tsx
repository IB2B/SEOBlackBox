"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { BlogTable } from "@/components/blogs/BlogTable";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { ROUTES, BLOG_STATUSES, PROJECTS } from "@/lib/constants";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Blog } from "@/types";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  SlidersHorizontal,
  X,
  Loader2,
  Eye,
  ArrowRight,
  Clock,
  CalendarDays,
  CalendarRange,
  Calendar,
  ArrowLeft,
  Sparkles,
  Target,
  Layers,
} from "lucide-react";

// Blog Preview Modal Component
function BlogPreviewModal({ blog, onClose }: { blog: Blog | null; onClose: () => void }) {
  if (!blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-auto bg-background rounded-2xl shadow-2xl border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Blog Preview</h3>
              <p className="text-xs text-muted-foreground">{blog.Project} • {blog.Language}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={blog.STEPS} />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Meta */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>Keyword: {blog.Keywords}</span>
            </div>
            <h1 className="text-2xl font-bold">
              {blog.TITLE || <span className="text-muted-foreground italic">No title yet</span>}
            </h1>
            {blog["META DESC"] && (
              <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                {blog["META DESC"]}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-xs text-muted-foreground mb-1">Sections</p>
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                {[blog["Section 1"], blog["Section 2"], blog["Section 3"], blog["Section 4"], blog["Section 5"], blog["Section 6"], blog["Section 7"]].filter(s => s && s.trim()).length}/7
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {blog.BODY ? "Complete" : "In Progress"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 truncate">
                {blog.Location || "Not set"}
              </p>
            </div>
          </div>

          {/* Introduction Preview */}
          {blog.INTRODUCTION && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Introduction
              </h4>
              <div
                className="text-sm text-muted-foreground line-clamp-4 prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.INTRODUCTION) }}
              />
            </div>
          )}

          {/* TL;DR */}
          {blog["TL;DR"] && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                TL;DR
              </h4>
              <div
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog["TL;DR"]) }}
              />
            </div>
          )}

          {/* Featured Image */}
          {blog["images URL"] && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Featured Image</h4>
              <img
                src={blog["images URL"]}
                alt="Featured"
                className="w-full h-48 object-cover rounded-xl border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-between p-4 border-t bg-background/95 backdrop-blur-sm">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
          <div className="flex gap-2">
            <Link href={ROUTES.BLOG_VIEW(blog.id)}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Full View
              </Button>
            </Link>
            <Link href={ROUTES.BLOG_EDIT(blog.id)}>
              <Button>
                Edit Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Date filter labels
const DATE_FILTER_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  today: { label: "Today's Blogs", icon: <Clock className="w-5 h-5" />, color: "emerald" },
  yesterday: { label: "Yesterday's Blogs", icon: <CalendarDays className="w-5 h-5" />, color: "blue" },
  week: { label: "This Week's Blogs", icon: <CalendarRange className="w-5 h-5" />, color: "violet" },
  month: { label: "This Month's Blogs", icon: <Calendar className="w-5 h-5" />, color: "amber" },
};

function BlogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlProject = searchParams.get("project") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlDateFilter = searchParams.get("dateFilter") || "";
  const showAll = searchParams.get("showAll") === "true";

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch);
  const [status, setStatus] = useState("");
  const [project, setProject] = useState(urlProject);
  const [dateFilter, setDateFilter] = useState(urlDateFilter);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(showAll ? 200 : 25);
  const [showFilters, setShowFilters] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Sync URL params with state when they change
  useEffect(() => {
    setProject(urlProject);
    setSearch(urlSearch);
    setDateFilter(urlDateFilter);
    setPage(1);
  }, [urlProject, urlSearch, urlDateFilter]);

  const activeFiltersCount = [status, project].filter(Boolean).length;
  const dateFilterInfo = dateFilter ? DATE_FILTER_LABELS[dateFilter] : null;

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (project) params.set("project", project);
      if (dateFilter) params.set("dateFilter", dateFilter);
      params.set("page", page.toString());
      params.set("size", pageSize.toString());

      const response = await fetch(`/api/blogs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
        setPagination({
          count: data.data.pagination.count,
          hasNext: data.data.pagination.hasNext,
          hasPrevious: data.data.pagination.hasPrevious,
        });
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, project, dateFilter, page, pageSize]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    toast.loading("Deleting blog...", { id: "delete-blog" });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Blog deleted successfully!", { id: "delete-blog" });
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to delete blog", { id: "delete-blog" });
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog", { id: "delete-blog" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const clearFilters = () => {
    setStatus("");
    setProject("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Blog Preview Modal */}
      <BlogPreviewModal blog={previewBlog} onClose={() => setPreviewBlog(null)} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {dateFilterInfo ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(ROUTES.BLOGS)}
                  className="gap-1 text-muted-foreground hover:text-foreground -ml-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Blogs
                </Button>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br from-${dateFilterInfo.color}-500/20 to-${dateFilterInfo.color}-500/10 rounded-xl`}>
                  <span className={`text-${dateFilterInfo.color}-600 dark:text-${dateFilterInfo.color}-400`}>
                    {dateFilterInfo.icon}
                  </span>
                </div>
                {dateFilterInfo.label}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {pagination.count} blog{pagination.count !== 1 ? 's' : ''} found
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl">
                  <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                Blogs
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Manage your blog posts and content
              </p>
            </>
          )}
        </div>
        <Link href={ROUTES.BLOG_NEW}>
          <Button size="lg" className="w-full md:w-auto gap-2">
            <Plus className="w-5 h-5" />
            Add Blog
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by keyword or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              <Search className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="ml-1.5 w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </form>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-44"
            >
              <option value="">All Status</option>
              {BLOG_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setPage(1);
              }}
              className="w-44"
            >
              <option value="">All Projects</option>
              {PROJECTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-32"
            >
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="200">All</option>
            </Select>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden space-y-3 pt-3 border-t border-border/50 animate-slide-down">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  {BLOG_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={project}
                  onChange={(e) => {
                    setProject(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Projects</option>
                  {PROJECTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-32"
                >
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                  <option value="200">All</option>
                </Select>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <BlogTable blogs={blogs} isLoading={isLoading} onDelete={handleDelete} onPreview={setPreviewBlog} />

      {/* Pagination */}
      {pagination.count > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium text-foreground">{blogs.length}</span> of{" "}
            <span className="font-medium text-foreground">{pagination.count}</span>{" "}
            blogs
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevious}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex items-center gap-1 px-3">
              <span className="text-sm font-medium">{page}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {Math.ceil(pagination.count / pageSize)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BlogsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Loading blogs...</p>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogsLoading />}>
      <BlogsContent />
    </Suspense>
  );
}
