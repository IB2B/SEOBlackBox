"use client";

import { useState } from "react";
import Link from "next/link";
import { useTracking } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { ClientTracker } from "@/components/dashboard/ClientTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Blog } from "@/types";
import {
  AlertCircle,
  Plus,
  FileText,
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  Clock,
  Sparkles,
  ExternalLink,
  Eye,
  X,
  CheckCircle2,
  Zap,
  BarChart3,
  Activity,
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

export default function DashboardPage() {
  const { data: trackingData, isLoading, error } = useTracking();
  const { user } = useAuth();
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get completed blogs
  const completedBlogs = trackingData?.projects
    ?.flatMap(p => p.recentBlogs)
    ?.filter(b => b.STEPS === "COMPLETED")
    ?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Blog Preview Modal */}
      <BlogPreviewModal blog={previewBlog} onClose={() => setPreviewBlog(null)} />

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-violet-300 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{today}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}!
              </h1>
              <p className="text-violet-200/80 max-w-md">
                Your content generation dashboard. Track, preview, and manage all your blogs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={ROUTES.BLOG_NEW}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog
                </Button>
              </Link>
              <Link href={ROUTES.BLOGS}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  All Blogs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Quick Stats */}
          {trackingData && !isLoading && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-violet-300" />
                  <p className="text-xs text-violet-300 uppercase tracking-wider">Total</p>
                </div>
                <p className="text-3xl font-bold">{trackingData.totals.totalBlogs}</p>
              </div>
              <div className="bg-amber-500/20 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/20 hover:bg-amber-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <p className="text-xs text-amber-300 uppercase tracking-wider">Queue</p>
                </div>
                <p className="text-3xl font-bold text-amber-200">{trackingData.totals.totalAutoPilot}</p>
              </div>
              <div className="bg-sky-500/20 backdrop-blur-sm rounded-2xl p-4 border border-sky-400/20 hover:bg-sky-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-sky-300" />
                  <p className="text-xs text-sky-300 uppercase tracking-wider">Processing</p>
                </div>
                <p className="text-3xl font-bold text-sky-200">{trackingData.totals.totalInProgress}</p>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/20 hover:bg-emerald-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-300" />
                  <p className="text-xs text-emerald-300 uppercase tracking-wider">Ready</p>
                </div>
                <p className="text-3xl font-bold text-emerald-200">{trackingData.totals.totalPublish}</p>
              </div>
              <div className="bg-fuchsia-500/20 backdrop-blur-sm rounded-2xl p-4 border border-fuchsia-400/20 hover:bg-fuchsia-500/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-300" />
                  <p className="text-xs text-fuchsia-300 uppercase tracking-wider">Done</p>
                </div>
                <p className="text-3xl font-bold text-fuchsia-200">{trackingData.totals.totalCompleted}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date-Based Activity Stats */}
      {trackingData && !isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              Production Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Today */}
              <Link href="/blogs?dateFilter=today" className="block">
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 group hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20">
                      <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">Today</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                  </div>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {trackingData.totals.totalToday || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">blogs created</p>
                  {(trackingData.totals.totalToday || 0) > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Yesterday */}
              <Link href="/blogs?dateFilter=yesterday" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 group hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-blue-500/20">
                      <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Yesterday</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {trackingData.totals.totalYesterday || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">blogs created</p>
                </div>
              </Link>

              {/* This Week */}
              <Link href="/blogs?dateFilter=week" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20 group hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-violet-500/20">
                      <CalendarRange className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-medium">This Week</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-violet-500" />
                  </div>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                    {trackingData.totals.totalThisWeek || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">blogs created</p>
                </div>
              </Link>

              {/* This Month */}
              <Link href="/blogs?dateFilter=month" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 group hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-amber-500/20">
                      <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium">This Month</span>
                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-amber-500" />
                  </div>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                    {trackingData.totals.totalThisMonth || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">blogs created</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blogs Created Today */}
      {trackingData && !isLoading && trackingData.todayBlogs && trackingData.todayBlogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                </div>
                Today's Blogs
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {trackingData.todayBlogs.length} blog{trackingData.todayBlogs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackingData.todayBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="flex items-center gap-4 p-3 rounded-xl border hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {blog.TITLE || blog.Keywords}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {blog.Project} • {blog.Language}
                    </p>
                  </div>
                  <StatusBadge status={blog.STEPS} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setPreviewBlog(blog)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link href={ROUTES.BLOG_EDIT(blog.id)}>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">Error loading data</p>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Tracker - Shows detailed project breakdown */}
      <ClientTracker data={trackingData} isLoading={isLoading} hideTopStats />
    </div>
  );
}
