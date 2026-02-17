import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";
import type { DashboardStats } from "@/types";

// GET /api/stats - Get dashboard statistics
export async function GET(request: Request) {
  try {
    // Still require authentication
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [blogStats, projectCount] = await Promise.all([
      baserow.getBlogStats(),
      baserow.getProjectCount(),
    ]);

    const stats: DashboardStats = {
      totalBlogs: blogStats.total,
      completedBlogs: blogStats.completed,
      autopilotBlogs: blogStats.autopilot,
      parkingBlogs: blogStats.parking,
      publishBlogs: blogStats.publish,
      inProgressBlogs: blogStats.inProgress,
      projects: projectCount,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.apiError("GET /api/stats", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get stats",
      },
      { status: 500 }
    );
  }
}
