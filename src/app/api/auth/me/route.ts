import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";

export async function GET(request: Request) {
  try {
    // User ID is set by middleware
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const baserowUser = await baserow.getUserById(parseInt(userId, 10));

    if (!baserowUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = {
      id: baserowUser.id,
      email: baserowUser.email,
      name: baserowUser.name,
      created_at: baserowUser.created_at,
    };

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user",
      },
      { status: 500 }
    );
  }
}
