import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";
import type { CreateBlogInput } from "@/types";

// Helper to format date as YYYY-MM-DD string (for consistent comparison)
function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get date range as strings (YYYY-MM-DD format) based on filter type
function getDateRange(filter: string): { start: string; end: string } | null {
  const now = new Date();
  const today = formatDateStr(now);

  // Calculate dates
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return { start: today, end: today };
    case "yesterday":
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: formatDateStr(yesterday), end: formatDateStr(yesterday) };
    case "week":
      const weekAgo = new Date(todayDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: formatDateStr(weekAgo), end: today };
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: formatDateStr(monthStart), end: today };
    default:
      return null;
  }
}

// Helper to check if a date string falls within a range (using string comparison)
function isDateInRange(dateStr: string | undefined, start: string, end: string): boolean {
  if (!dateStr) return false;
  // Extract just the date part (YYYY-MM-DD) in case it has time
  const dateOnly = dateStr.split('T')[0];
  // String comparison works for YYYY-MM-DD format
  return dateOnly >= start && dateOnly <= end;
}

// GET /api/blogs - List all blogs
export async function GET(request: Request) {
  try {
    // Still require authentication, just don't filter by email
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const project = searchParams.get("project") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFilter = searchParams.get("dateFilter") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("size") || "25", 10);
    // Default to showing newest first
    const sortNewest = searchParams.get("sortNewest") !== "false";

    // If dateFilter is specified, we need to fetch more and filter client-side
    if (dateFilter) {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        // Fetch blogs to filter by date (Baserow limits to 200 per page)
        const response = await baserow.getBlogs({
          status,
          project,
          search,
          size: 200, // Baserow max page size is 200
          sortNewest: true,
        });

        let blogs = baserow.transformBlogs(response.results);

        // Filter by date (using string comparison for YYYY-MM-DD format)
        blogs = blogs.filter(blog =>
          isDateInRange(blog.Created_At, dateRange.start, dateRange.end)
        );

        // Apply pagination
        const startIndex = (page - 1) * size;
        const paginatedBlogs = blogs.slice(startIndex, startIndex + size);

        return NextResponse.json({
          success: true,
          data: {
            blogs: paginatedBlogs,
            pagination: {
              count: blogs.length,
              page,
              size,
              hasNext: startIndex + size < blogs.length,
              hasPrevious: page > 1,
            },
            dateFilter,
          },
        });
      }
    }

    const response = await baserow.getBlogs({
      status,
      project,
      search,
      page,
      size,
      sortNewest,
    });

    const blogs = baserow.transformBlogs(response.results);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        pagination: {
          count: response.count,
          page,
          size,
          hasNext: response.next !== null,
          hasPrevious: response.previous !== null,
        },
      },
    });
  } catch (error) {
    logger.apiError("GET /api/blogs", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get blogs",
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog/keyword
export async function POST(request: Request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { Keywords, Project, Language, Language_Code, Country_Code, NTOC, STEPS, Location } = body;
    const needsApproval = body["Needs Approval?"] || false;

    // Validate input
    if (!Keywords || !Project) {
      return NextResponse.json(
        { success: false, error: "Keywords and Project are required" },
        { status: 400 }
      );
    }

    // Accept various formats of STEPS
    const validSteps = ["PARKING", "Parking", "Auto Pilot", "auto pilot"];
    if (!validSteps.some(s => s.toLowerCase() === STEPS?.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "STEPS must be 'Parking' or 'Auto Pilot'" },
        { status: 400 }
      );
    }

    const blog = await baserow.createBlog({
      Keywords,
      Project,
      Language: Language || "English",
      Language_Code: Language_Code || "en",
      Country_Code: Country_Code || "us",
      NTOC: NTOC || "5",
      STEPS,
      "Needs Approval?": needsApproval,
      Location: Location || "",
    });

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    logger.apiError("POST /api/blogs", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create blog",
      },
      { status: 500 }
    );
  }
}
