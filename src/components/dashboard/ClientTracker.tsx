"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/blogs/StatusBadge";
import { ROUTES, PROJECT_NAME_TO_ID } from "@/lib/constants";
import type { Blog } from "@/types";
import {
  Building2,
  FileText,
  Zap,
  Send,
  TrendingUp,
  ExternalLink,
  MoreHorizontal,
  Layers
} from "lucide-react";

interface ProjectData {
  name: string;
  total: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  completed: number;
  autoPilot: number;
  publish: number;
  inProgress: number;
  parking: number;
  recentBlogs: Blog[];
}

interface TrackingData {
  projects: ProjectData[];
  totals: {
    totalBlogs: number;
    totalProjects: number;
    totalCompleted: number;
    totalAutoPilot: number;
    totalPublish: number;
    totalInProgress: number;
    totalParking: number;
  };
  lastUpdated: string;
}

interface ClientTrackerProps {
  data: TrackingData | null;
  isLoading: boolean;
  hideTopStats?: boolean;
}

function ProjectCard({ project }: { project: ProjectData }) {
  const projectId = PROJECT_NAME_TO_ID[project.name] || "";
  const projectUrl = `${ROUTES.BLOGS}?project=${projectId}&showAll=true`;

  return (
    <Link href={projectUrl} className="block">
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl border border-violet-500/20 group-hover:from-violet-500/30 group-hover:to-purple-500/20 transition-colors">
                <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base truncate max-w-[180px] group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{project.name}</h3>
                <p className="text-xs text-muted-foreground">{project.total} total blogs</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <ExternalLink className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-none">{project.autoPilot}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Auto Pilot</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20">
            <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">{project.publish}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Publish</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-sky-500/15 to-blue-500/10 border border-sky-500/20">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-lg font-bold text-sky-600 dark:text-sky-400 leading-none">{project.inProgress}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Draft</p>
            </div>
          </div>
        </div>

        {/* Recent Blogs List */}
        {project.recentBlogs.length > 0 && (
          <div onClick={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Recent Activity
              </span>
            </div>
            <div className="space-y-1.5">
              {project.recentBlogs.slice(0, 3).map((blog, index) => (
                <div
                  key={blog.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = ROUTES.BLOG_VIEW(blog.id);
                  }}
                  className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-violet-500/10 transition-colors cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-medium text-violet-600 dark:text-violet-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                      {blog.TITLE || blog.Keywords}
                    </p>
                  </div>
                  <StatusBadge status={blog.STEPS} />
                </div>
              ))}
            </div>
            {project.recentBlogs.length > 3 && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = projectUrl;
                }}
                className="flex items-center justify-center gap-1 mt-3 py-2 text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
                View {project.total - 3} more
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {project.recentBlogs.length === 0 && (
          <div className="text-center py-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-muted-foreground">No blogs yet</p>
            <Button
              variant="link"
              size="sm"
              className="mt-1 text-violet-600 dark:text-violet-400"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = ROUTES.BLOG_NEW;
              }}
            >
              Add your first blog
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-sm">
          <div className="h-1 bg-muted animate-pulse" />
          <CardContent className="p-5">
            {/* Header skeleton */}
            <div className="flex items-start gap-3 mb-5">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="flex gap-2 mb-5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex-1 h-16 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
            {/* List skeleton */}
            <div className="space-y-2">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center gap-3 p-2.5">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ClientTracker({ data, isLoading, hideTopStats = false }: ClientTrackerProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Unable to load tracking data</p>
          <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (data.projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No projects found</p>
          <Link href={ROUTES.BLOG_NEW}>
            <Button className="mt-4">Add Your First Blog</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats - only show if not hidden */}
      {!hideTopStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{data.totals.totalBlogs}</p>
                  <p className="text-sm text-muted-foreground">Total Blogs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{data.totals.totalAutoPilot}</p>
                  <p className="text-sm text-muted-foreground">Auto Pilot</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{data.totals.totalPublish}</p>
                  <p className="text-sm text-muted-foreground">Publish</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-0 bg-gradient-to-br from-sky-500/10 to-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-lg shadow-sky-500/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">{data.totals.totalInProgress}</p>
                  <p className="text-sm text-muted-foreground">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            Client Projects
          </h2>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
