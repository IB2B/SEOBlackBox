import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";
import type { Blog } from "@/types";

// Status categories for proper counting
const STATUS_CATEGORIES = {
  COMPLETED: ["COMPLETED"],
  PARKING: ["PARKING"],
  AUTO_PILOT: ["Auto Pilot"],
  PUBLISH: ["PUBLISH"],
  IN_PROGRESS: ["SERP", "Title", "Permalink", "Meta Description", "Introduction", "TOC", "TL;DR", "Conclusion", "Full"],
  WAIT: ["WAIT"],
  OTHER: ["ATOMA", "HARLOCK", "Positive", "Neutral", "Negative"],
};

// Limits for response payload - prevents sending too much data
const LIMITS = {
  TODAY_BLOGS: 15,
  YESTERDAY_BLOGS: 10,
  WEEK_BLOGS: 20,
  MONTH_BLOGS: 25,
  RECENT_PER_PROJECT: 3,
};

function getStatusCategory(status: string | undefined): string {
  if (!status) return "IN_PROGRESS";
  const upperStatus = status.toUpperCase();

  if (STATUS_CATEGORIES.COMPLETED.some(s => s.toUpperCase() === upperStatus)) return "COMPLETED";
  if (STATUS_CATEGORIES.PARKING.some(s => s.toUpperCase() === upperStatus)) return "PARKING";
  if (STATUS_CATEGORIES.AUTO_PILOT.some(s => s.toUpperCase() === upperStatus)) return "AUTO_PILOT";
  if (STATUS_CATEGORIES.PUBLISH.some(s => s.toUpperCase() === upperStatus)) return "PUBLISH";
  if (STATUS_CATEGORIES.IN_PROGRESS.some(s => s.toUpperCase() === upperStatus)) return "IN_PROGRESS";
  if (STATUS_CATEGORIES.WAIT.some(s => s.toUpperCase() === upperStatus)) return "WAIT";

  return "IN_PROGRESS";
}

function isDateInRange(dateStr: string | undefined, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    return date >= start && date < end;
  } catch {
    return false;
  }
}

// Slim blog object - only fields needed for dashboard display
function slimBlog(blog: Blog): Partial<Blog> {
  return {
    id: blog.id,
    Keywords: blog.Keywords,
    TITLE: blog.TITLE,
    Project: blog.Project,
    STEPS: blog.STEPS,
    Language: blog.Language,
    Created_At: blog.Created_At,
  };
}

// GET /api/tracking - Get blogs grouped by project with date tracking
export async function GET(request: Request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all blogs (we'll group them on the server)
    const response = await baserow.getBlogs({
      size: 200, // Get more blogs for tracking
      sortNewest: true,
    });

    const blogs = baserow.transformBlogs(response.results);

    // Get current date info for date-based tracking
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Group blogs by project (with slim blog objects)
    const projectsMap = new Map<string, {
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
      recentBlogs: Partial<Blog>[];
    }>();

    // Track global date stats and collect blogs by date range (with limits)
    let globalToday = 0;
    let globalYesterday = 0;
    let globalThisWeek = 0;
    let globalThisMonth = 0;
    const todayBlogs: Partial<Blog>[] = [];
    const yesterdayBlogs: Partial<Blog>[] = [];
    const thisWeekBlogs: Partial<Blog>[] = [];
    const thisMonthBlogs: Partial<Blog>[] = [];

    blogs.forEach((blog) => {
      const projectName = blog.Project || "Unknown";

      if (!projectsMap.has(projectName)) {
        projectsMap.set(projectName, {
          name: projectName,
          total: 0,
          today: 0,
          yesterday: 0,
          thisWeek: 0,
          thisMonth: 0,
          completed: 0,
          autoPilot: 0,
          publish: 0,
          inProgress: 0,
          parking: 0,
          recentBlogs: [],
        });
      }

      const project = projectsMap.get(projectName)!;
      project.total++;

      // Date-based tracking using Created_At field
      // Count all, but only store limited slim versions for response
      const createdAt = blog.Created_At;
      if (createdAt) {
        if (isDateInRange(createdAt, todayStart, todayEnd)) {
          project.today++;
          globalToday++;
          if (todayBlogs.length < LIMITS.TODAY_BLOGS) {
            todayBlogs.push(slimBlog(blog));
          }
        }
        if (isDateInRange(createdAt, yesterdayStart, todayStart)) {
          project.yesterday++;
          globalYesterday++;
          if (yesterdayBlogs.length < LIMITS.YESTERDAY_BLOGS) {
            yesterdayBlogs.push(slimBlog(blog));
          }
        }
        if (isDateInRange(createdAt, thisWeekStart, todayEnd)) {
          project.thisWeek++;
          globalThisWeek++;
          if (thisWeekBlogs.length < LIMITS.WEEK_BLOGS) {
            thisWeekBlogs.push(slimBlog(blog));
          }
        }
        if (isDateInRange(createdAt, thisMonthStart, todayEnd)) {
          project.thisMonth++;
          globalThisMonth++;
          if (thisMonthBlogs.length < LIMITS.MONTH_BLOGS) {
            thisMonthBlogs.push(slimBlog(blog));
          }
        }
      }

      // Count by status using proper categorization
      const category = getStatusCategory(blog.STEPS);
      switch (category) {
        case "COMPLETED":
          project.completed++;
          break;
        case "PARKING":
          project.parking++;
          break;
        case "AUTO_PILOT":
          project.autoPilot++;
          break;
        case "PUBLISH":
          project.publish++;
          break;
        default:
          project.inProgress++;
          break;
      }

      // Add to recent blogs (limited per project, slim version)
      if (project.recentBlogs.length < LIMITS.RECENT_PER_PROJECT) {
        project.recentBlogs.push(slimBlog(blog));
      }
    });

    // Convert map to array and sort by total blogs descending
    const projects = Array.from(projectsMap.values()).sort((a, b) => b.total - a.total);

    // Calculate totals
    const totals = {
      totalBlogs: blogs.length,
      totalProjects: projects.length,
      totalCompleted: projects.reduce((sum, p) => sum + p.completed, 0),
      totalAutoPilot: projects.reduce((sum, p) => sum + p.autoPilot, 0),
      totalPublish: projects.reduce((sum, p) => sum + p.publish, 0),
      totalInProgress: projects.reduce((sum, p) => sum + p.inProgress, 0),
      totalParking: projects.reduce((sum, p) => sum + p.parking, 0),
      // Date-based totals
      totalToday: globalToday,
      totalYesterday: globalYesterday,
      totalThisWeek: globalThisWeek,
      totalThisMonth: globalThisMonth,
    };

    // Return with cache headers (cache for 30 seconds)
    return NextResponse.json(
      {
        success: true,
        data: {
          projects,
          totals,
          todayBlogs,
          yesterdayBlogs,
          thisWeekBlogs,
          thisMonthBlogs,
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    logger.apiError("GET /api/tracking", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get tracking data",
      },
      { status: 500 }
    );
  }
}
