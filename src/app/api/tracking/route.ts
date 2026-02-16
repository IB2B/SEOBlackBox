import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";

// Status categories for proper counting
const STATUS_CATEGORIES = {
  COMPLETED: ["COMPLETED"],
  PARKING: ["PARKING"],
  AUTO_PILOT: ["Auto Pilot"],
  PUBLISH: ["PUBLISH"],
  // All statuses that indicate work in progress
  IN_PROGRESS: ["SERP", "Title", "Permalink", "Meta Description", "Introduction", "TOC", "TL;DR", "Conclusion", "Full"],
  // Special statuses
  WAIT: ["WAIT"],
  OTHER: ["ATOMA", "HARLOCK", "Positive", "Neutral", "Negative"],
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

  return "IN_PROGRESS"; // Default fallback
}

// Helper to check if a date string falls within a range
function isDateInRange(dateStr: string | undefined, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    return date >= start && date < end;
  } catch {
    return false;
  }
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

    // Group blogs by project
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
      recentBlogs: typeof blogs;
    }>();

    // Also track global date stats and collect today's blogs
    let globalToday = 0;
    let globalYesterday = 0;
    let globalThisWeek = 0;
    let globalThisMonth = 0;
    const todayBlogs: typeof blogs = [];

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
      const createdAt = blog.Created_At;
      if (createdAt) {
        if (isDateInRange(createdAt, todayStart, todayEnd)) {
          project.today++;
          globalToday++;
          todayBlogs.push(blog);
        }
        if (isDateInRange(createdAt, yesterdayStart, todayStart)) {
          project.yesterday++;
          globalYesterday++;
        }
        if (isDateInRange(createdAt, thisWeekStart, todayEnd)) {
          project.thisWeek++;
          globalThisWeek++;
        }
        if (isDateInRange(createdAt, thisMonthStart, todayEnd)) {
          project.thisMonth++;
          globalThisMonth++;
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

      // Add to recent blogs (max 5 per project)
      if (project.recentBlogs.length < 5) {
        project.recentBlogs.push(blog);
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

    return NextResponse.json({
      success: true,
      data: {
        projects,
        totals,
        todayBlogs,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Get tracking error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get tracking data",
      },
      { status: 500 }
    );
  }
}
