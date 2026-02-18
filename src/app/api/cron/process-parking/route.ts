import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";

// GET /api/cron/process-parking - Move PARKING blogs to Auto Pilot
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends Authorization: Bearer <CRON_SECRET>)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch all blogs with PARKING status (ID: 5133)
    const response = await baserow.getBlogs({ status: "5133", size: 200 });
    const blogs = baserow.transformBlogs(response.results);

    let processed = 0;
    let failed = 0;

    // Update each blog to Auto Pilot (ID: 5141)
    for (const blog of blogs) {
      try {
        await baserow.updateBlog(blog.id, { STEPS: 5141 });
        processed++;
      } catch (error) {
        failed++;
        logger.error(
          `Failed to update blog ${blog.id}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: blogs.length,
        processed,
        failed,
      },
    });
  } catch (error) {
    logger.apiError("GET /api/cron/process-parking", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process parking blogs",
      },
      { status: 500 }
    );
  }
}
