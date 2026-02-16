import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";

// GET /api/blogs/recent - Get most recent blogs
export async function GET(request: Request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const blogs = await baserow.getRecentBlogs(limit);

    return NextResponse.json({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.error("Get recent blogs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get recent blogs",
      },
      { status: 500 }
    );
  }
}
