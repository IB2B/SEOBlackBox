"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogListItem, BlogListEmpty, BlogListSkeleton } from "./BlogListItem";
import { ClientTracker } from "./ClientTracker";
import { ROUTES } from "@/lib/constants";
import { ArrowRight, Clock, CalendarDays, CalendarRange, Building2, History } from "lucide-react";
import type { Blog, BlogStatus } from "@/types";

// Slim blog type - only fields returned by optimized API
type SlimBlog = Pick<Blog, "id" | "Keywords" | "TITLE" | "Project" | "STEPS" | "Language" | "Created_At">;

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
  recentBlogs: SlimBlog[];
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
    totalToday: number;
    totalYesterday: number;
    totalThisWeek: number;
    totalThisMonth: number;
  };
  todayBlogs: SlimBlog[];
  yesterdayBlogs: SlimBlog[];
  thisWeekBlogs: SlimBlog[];
  thisMonthBlogs: SlimBlog[];
  lastUpdated: string;
}

interface DashboardTabsProps {
  data: TrackingData | null;
  isLoading: boolean;
}

export function DashboardTabs({ data, isLoading }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("today");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <BlogListSkeleton count={5} />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to load data</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleStatusChange = (blogId: number, newStatus: BlogStatus) => {
    // Status was already updated via API in InlineStatusSelect
    // Could add optimistic update logic here if needed
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="today" count={data.totals.totalToday}>
                <Clock className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Today
              </TabsTrigger>
              <TabsTrigger value="yesterday" count={data.totals.totalYesterday}>
                <History className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Yesterday
              </TabsTrigger>
              <TabsTrigger value="week" count={data.totals.totalThisWeek}>
                <CalendarDays className="w-4 h-4 mr-1.5 hidden sm:inline" />
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" count={data.totals.totalThisMonth}>
                <CalendarRange className="w-4 h-4 mr-1.5 hidden sm:inline" />
                This Month
              </TabsTrigger>
              <TabsTrigger value="projects" count={data.totals.totalProjects}>
                <Building2 className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Projects
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Today's Blogs */}
          <TabsContent value="today">
            <div className="space-y-2">
              {data.todayBlogs.length > 0 ? (
                <>
                  {data.todayBlogs.slice(0, 10).map((blog, index) => (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      index={index}
                                            onStatusChange={handleStatusChange}
                    />
                  ))}
                  {data.todayBlogs.length > 10 && (
                    <Link href={`${ROUTES.BLOGS}?dateFilter=today`} className="block">
                      <Button variant="ghost" className="w-full mt-2">
                        View all {data.todayBlogs.length} blogs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <BlogListEmpty message="No blogs created today" />
              )}
            </div>
            {data.todayBlogs.length > 0 && data.todayBlogs.length <= 10 && (
              <div className="mt-4 pt-4 border-t">
                <Link href={`${ROUTES.BLOGS}?dateFilter=today`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Today's Blogs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Yesterday's Blogs */}
          <TabsContent value="yesterday">
            <div className="space-y-2">
              {data.yesterdayBlogs.length > 0 ? (
                <>
                  {data.yesterdayBlogs.slice(0, 10).map((blog, index) => (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      index={index}
                                            onStatusChange={handleStatusChange}
                    />
                  ))}
                  {data.yesterdayBlogs.length > 10 && (
                    <Link href={`${ROUTES.BLOGS}?dateFilter=yesterday`} className="block">
                      <Button variant="ghost" className="w-full mt-2">
                        View all {data.yesterdayBlogs.length} blogs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <BlogListEmpty message="No blogs created yesterday" />
              )}
            </div>
            {data.yesterdayBlogs.length > 0 && data.yesterdayBlogs.length <= 10 && (
              <div className="mt-4 pt-4 border-t">
                <Link href={`${ROUTES.BLOGS}?dateFilter=yesterday`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Yesterday's Blogs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* This Week's Blogs */}
          <TabsContent value="week">
            <div className="space-y-2">
              {data.thisWeekBlogs.length > 0 ? (
                <>
                  {data.thisWeekBlogs.slice(0, 15).map((blog, index) => (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      index={index}
                                            onStatusChange={handleStatusChange}
                    />
                  ))}
                  {data.thisWeekBlogs.length > 15 && (
                    <Link href={`${ROUTES.BLOGS}?dateFilter=week`} className="block">
                      <Button variant="ghost" className="w-full mt-2">
                        View all {data.thisWeekBlogs.length} blogs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <BlogListEmpty message="No blogs created this week" />
              )}
            </div>
            {data.thisWeekBlogs.length > 0 && data.thisWeekBlogs.length <= 15 && (
              <div className="mt-4 pt-4 border-t">
                <Link href={`${ROUTES.BLOGS}?dateFilter=week`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All This Week's Blogs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* This Month's Blogs */}
          <TabsContent value="month">
            <div className="space-y-2">
              {data.thisMonthBlogs.length > 0 ? (
                <>
                  {data.thisMonthBlogs.slice(0, 20).map((blog, index) => (
                    <BlogListItem
                      key={blog.id}
                      blog={blog}
                      index={index}
                                            onStatusChange={handleStatusChange}
                    />
                  ))}
                  {data.thisMonthBlogs.length > 20 && (
                    <Link href={`${ROUTES.BLOGS}?dateFilter=month`} className="block">
                      <Button variant="ghost" className="w-full mt-2">
                        View all {data.thisMonthBlogs.length} blogs
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <BlogListEmpty message="No blogs created this month" />
              )}
            </div>
            {data.thisMonthBlogs.length > 0 && data.thisMonthBlogs.length <= 20 && (
              <div className="mt-4 pt-4 border-t">
                <Link href={`${ROUTES.BLOGS}?dateFilter=month`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All This Month's Blogs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Projects */}
          <TabsContent value="projects">
            <ClientTracker data={data} isLoading={false} hideTopStats />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
