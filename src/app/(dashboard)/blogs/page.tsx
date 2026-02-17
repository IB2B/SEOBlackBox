"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { Card } from "@/components/ui/card";
import { BlogTable } from "@/components/blogs/BlogTable";
import { ROUTES, BLOG_STATUSES, PROJECTS } from "@/lib/constants";
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
  Clock,
  CalendarDays,
  CalendarRange,
  Calendar,
  ArrowLeft,
  Activity,
  FolderOpen,
  LayoutGrid,
} from "lucide-react";

// Date filter options for dropdown
const DATE_FILTER_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

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

  const activeFiltersCount = [status, project, dateFilter].filter(Boolean).length;
  const dateFilterInfo = dateFilter ? DATE_FILTER_LABELS[dateFilter] : null;

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (project) params.set("project", project);
      if (dateFilter) params.set("dateFilter", dateFilter);
      params.set("page", page.toString());
      params.set("size", pageSize.toString());

      const response = await fetch(`/api/blogs?${params.toString()}`, {
        credentials: "include",
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
      // Error handled by state
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
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Blog deleted successfully!", { id: "delete-blog" });
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to delete blog", { id: "delete-blog" });
      }
    } catch (error) {
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
    setDateFilter("");
    setPage(1);
    // Also clear URL params
    router.push(ROUTES.BLOGS);
  };

  return (
    <div className="space-y-6">
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
      <Card variant="glass" className="p-4 overflow-visible relative z-20">
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
            <Dropdown
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="All Status"
              icon={<Activity className="w-4 h-4" />}
              dropdownSize="sm"
              className="w-44"
              options={[
                { value: "", label: "All Status" },
                ...BLOG_STATUSES.map((s) => ({
                  value: s.value,
                  label: s.label,
                })),
              ]}
            />
            <Dropdown
              value={project}
              onChange={(val) => {
                setProject(val);
                setPage(1);
              }}
              placeholder="All Projects"
              icon={<FolderOpen className="w-4 h-4" />}
              dropdownSize="sm"
              className="w-48"
              options={[
                { value: "", label: "All Projects" },
                ...PROJECTS.map((p) => ({
                  value: p.value,
                  label: p.label,
                })),
              ]}
            />
            <Dropdown
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                setPage(1);
              }}
              placeholder="All Time"
              icon={<Calendar className="w-4 h-4" />}
              dropdownSize="sm"
              className="w-40"
              options={DATE_FILTER_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
            <Dropdown
              value={pageSize.toString()}
              onChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
              icon={<LayoutGrid className="w-4 h-4" />}
              dropdownSize="sm"
              className="w-36"
              options={[
                { value: "25", label: "25 / page" },
                { value: "50", label: "50 / page" },
                { value: "100", label: "100 / page" },
                { value: "200", label: "All" },
              ]}
            />

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground hover:bg-red-500/10 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden space-y-3 pt-4 border-t border-border/50 animate-slide-down">
              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  value={status}
                  onChange={(val) => {
                    setStatus(val);
                    setPage(1);
                  }}
                  placeholder="All Status"
                  icon={<Activity className="w-4 h-4" />}
                  dropdownSize="sm"
                  options={[
                    { value: "", label: "All Status" },
                    ...BLOG_STATUSES.map((s) => ({
                      value: s.value,
                      label: s.label,
                    })),
                  ]}
                />
                <Dropdown
                  value={project}
                  onChange={(val) => {
                    setProject(val);
                    setPage(1);
                  }}
                  placeholder="All Projects"
                  icon={<FolderOpen className="w-4 h-4" />}
                  dropdownSize="sm"
                  options={[
                    { value: "", label: "All Projects" },
                    ...PROJECTS.map((p) => ({
                      value: p.value,
                      label: p.label,
                    })),
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  value={dateFilter}
                  onChange={(val) => {
                    setDateFilter(val);
                    setPage(1);
                  }}
                  placeholder="All Time"
                  icon={<Calendar className="w-4 h-4" />}
                  dropdownSize="sm"
                  options={DATE_FILTER_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
                <Dropdown
                  value={pageSize.toString()}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                  icon={<LayoutGrid className="w-4 h-4" />}
                  dropdownSize="sm"
                  options={[
                    { value: "25", label: "25 / page" },
                    { value: "50", label: "50 / page" },
                    { value: "100", label: "100 / page" },
                    { value: "200", label: "All" },
                  ]}
                />
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-950"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <BlogTable blogs={blogs} isLoading={isLoading} onDelete={handleDelete} />

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
