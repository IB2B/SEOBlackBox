import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";

// GET /api/projects - List all projects
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

    const projects = await baserow.getProjects();

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    logger.apiError("GET /api/projects", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get projects",
      },
      { status: 500 }
    );
  }
}
