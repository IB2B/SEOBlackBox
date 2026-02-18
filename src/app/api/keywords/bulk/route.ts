import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { logger } from "@/lib/logger";

// POST /api/keywords/bulk - Bulk create blogs from keyword list
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
    const {
      keywords,
      Project,
      Language,
      Language_Code,
      Country_Code,
      NTOC,
    } = body;
    const needsApproval = body["Needs Approval?"] || false;

    // Validate keywords
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: "Keywords array is required" },
        { status: 400 }
      );
    }

    if (keywords.length > 50) {
      return NextResponse.json(
        { success: false, error: "Maximum 50 keywords per batch" },
        { status: 400 }
      );
    }

    if (!Project) {
      return NextResponse.json(
        { success: false, error: "Project is required" },
        { status: 400 }
      );
    }

    const results: { keyword: string; success: boolean; error?: string }[] = [];
    let created = 0;
    let failed = 0;

    // Process sequentially to avoid Baserow rate limits
    for (const keyword of keywords) {
      const trimmed = keyword.trim();
      if (!trimmed) {
        continue;
      }

      try {
        await baserow.createBlog({
          Keywords: trimmed,
          Project,
          Language: Language || "English",
          Language_Code: Language_Code || "en",
          Country_Code: Country_Code || "us",
          NTOC: NTOC || "5",
          STEPS: "PARKING",
          "Needs Approval?": needsApproval,
        });
        created++;
        results.push({ keyword: trimmed, success: true });
      } catch (error) {
        failed++;
        results.push({
          keyword: trimmed,
          success: false,
          error: error instanceof Error ? error.message : "Failed to create",
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: keywords.length,
        created,
        failed,
        results,
      },
    });
  } catch (error) {
    logger.apiError("POST /api/keywords/bulk", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process keywords",
      },
      { status: 500 }
    );
  }
}
