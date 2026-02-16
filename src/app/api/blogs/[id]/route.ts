import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";
import { validateBlogFields } from "@/lib/validation";
import type { UpdateBlogInput } from "@/types";

// GET /api/blogs/[id] - Get single blog
export async function GET(
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

    const blog = await baserow.getBlogById(blogId);
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
    logger.apiError("GET /api/blogs/[id]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get blog",
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(
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

    const body: UpdateBlogInput = await request.json();

    // Build update data - only include fields that are provided
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "TITLE",
      "INTRODUCTION",
      "CONCLUSION",
      "TL;DR",
      "Section 1",
      "Section 2",
      "Section 3",
      "Section 4",
      "Section 5",
      "Section 6",
      "Section 7",
      "FAQ",
      "Permalink",
      "META DESC",
      "images URL",
      "image 1",
      "image 2",
      "image 3",
      "image 4",
      "BODY",
      "STEPS",
      "Needs Approval?",
      "Article Category",
    ];

    for (const field of allowedFields) {
      if (body[field as keyof UpdateBlogInput] !== undefined) {
        updateData[field] = body[field as keyof UpdateBlogInput];
      }
    }

    // Validate input fields
    const validation = validateBlogFields(updateData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    const blog = await baserow.updateBlog(blogId, updateData);

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
    logger.apiError("PUT /api/blogs/[id]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update blog",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(
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

    const deleted = await baserow.deleteBlog(blogId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    logger.apiError("DELETE /api/blogs/[id]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete blog",
      },
      { status: 500 }
    );
  }
}
