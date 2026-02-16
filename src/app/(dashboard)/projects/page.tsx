"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES, PROJECTS } from "@/lib/constants";
import {
  Loader2,
  FolderKanban,
  FileText,
  ArrowRight,
  Plus,
  Building2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface ProjectStats {
  name: string;
  blogCount: number;
  color: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const projectsResponse = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsResponse.json();

      if (projectsData.success) {
        const projectStats: ProjectStats[] = projectsData.data.map(
          (projectName: string) => {
            const projectInfo = PROJECTS.find((p) => p.value === projectName);
            return {
              name: projectName,
              blogCount: 0,
              color: projectInfo?.color || "gray",
            };
          }
        );

        const blogsResponse = await fetch("/api/blogs?size=200", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blogsData = await blogsResponse.json();

        if (blogsData.success) {
          const counts: Record<string, number> = {};
          blogsData.data.blogs.forEach((blog: { Project: string }) => {
            counts[blog.Project] = (counts[blog.Project] || 0) + 1;
          });

          projectStats.forEach((project) => {
            project.blogCount = counts[project.name] || 0;
          });
        }

        setProjects(projectStats);
      } else {
        setError(projectsData.error || "Failed to load projects");
      }
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getGradientClass = (color: string) => {
    const gradientMap: Record<string, string> = {
      "dark-red": "from-red-600 to-rose-700",
      "light-blue": "from-sky-400 to-blue-500",
      "light-green": "from-emerald-400 to-teal-500",
      "light-orange": "from-amber-400 to-orange-500",
      "dark-green": "from-green-600 to-emerald-700",
      orange: "from-orange-500 to-amber-600",
      purple: "from-violet-500 to-purple-600",
      "light-gray": "from-gray-400 to-slate-500",
      blue: "from-blue-500 to-indigo-600",
      gray: "from-gray-500 to-slate-600",
    };
    return gradientMap[color] || "from-gray-500 to-slate-600";
  };

  const getBgGradientClass = (color: string) => {
    const gradientMap: Record<string, string> = {
      "dark-red": "from-red-500/10 to-rose-500/5",
      "light-blue": "from-sky-500/10 to-blue-500/5",
      "light-green": "from-emerald-500/10 to-teal-500/5",
      "light-orange": "from-amber-500/10 to-orange-500/5",
      "dark-green": "from-green-500/10 to-emerald-500/5",
      orange: "from-orange-500/10 to-amber-500/5",
      purple: "from-violet-500/10 to-purple-500/5",
      "light-gray": "from-gray-500/10 to-slate-500/5",
      blue: "from-blue-500/10 to-indigo-500/5",
      gray: "from-gray-500/10 to-slate-500/5",
    };
    return gradientMap[color] || "from-gray-500/10 to-slate-500/5";
  };

  const totalBlogs = projects.reduce((sum, p) => sum + p.blogCount, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl">
              <FolderKanban className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            Projects
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View and manage your blog posts by project
          </p>
        </div>
        <Link href={ROUTES.BLOG_NEW}>
          <Button size="lg" className="w-full md:w-auto gap-2">
            <Plus className="w-5 h-5" />
            Add Blog
          </Button>
        </Link>
      </div>

      {error && (
        <Card variant="glass" className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4 flex items-center gap-3 text-red-600 dark:text-red-400">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBlogs}</p>
                <p className="text-xs text-muted-foreground">Total Blogs</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.length > 0 ? Math.round(totalBlogs / projects.length) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Avg per Project</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter((p) => p.blogCount > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {projects.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 mb-4">
            <FolderKanban className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first blog to start a project
          </p>
          <Link href={ROUTES.BLOG_NEW}>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Add Blog
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <Link
              key={project.name}
              href={`${ROUTES.BLOGS}?project=${encodeURIComponent(project.name)}`}
              className="block animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Card
                variant="interactive"
                className={`relative overflow-hidden bg-gradient-to-br ${getBgGradientClass(project.color)} group cursor-pointer`}
              >
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradientClass(project.color)}`} />

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-gradient-to-br ${getGradientClass(project.color)} rounded-xl shadow-lg`}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {project.blogCount} {project.blogCount === 1 ? "blog" : "blogs"}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getGradientClass(project.color)} transition-all duration-500`}
                      style={{
                        width: `${Math.min((project.blogCount / Math.max(totalBlogs, 1)) * 100 * 3, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round((project.blogCount / Math.max(totalBlogs, 1)) * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Available Projects Legend */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
            Available Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {PROJECTS.map((project) => (
              <div
                key={project.value}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getGradientClass(project.color)}`} />
                <span className="text-sm truncate">{project.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
