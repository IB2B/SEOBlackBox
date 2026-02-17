import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";
import { USER_EDITABLE_STATUSES } from "@/lib/constants";

// PATCH /api/blogs/[id]/status - Update blog status only
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json(
        { success: false, error: "Invalid blog ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate that the status is user-editable
    if (!USER_EDITABLE_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Allowed: ${USER_EDITABLE_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Update only the STEPS field
    const blog = await baserow.updateBlog(blogId, { STEPS: status });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    logger.apiError("PATCH /api/blogs/[id]/status", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update blog status",
      },
      { status: 500 }
    );
  }
}
