import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIP, getRateLimitHeaders } from "@/lib/rate-limit";

// Allowed image content types
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];

// Max image size: 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Validate that the URL is a safe external image URL.
 * Blocks SSRF by rejecting private IPs, local hostnames, and non-http(s) schemes.
 */
function isAllowedImageUrl(urlStr: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return false;
  }

  // Only allow http(s)
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and loopback
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname === "::1"
  ) {
    return false;
  }

  // Block private IP ranges
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const octets = parts.map(Number);
    // 10.x.x.x
    if (octets[0] === 10) return false;
    // 172.16.x.x - 172.31.x.x
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
    // 192.168.x.x
    if (octets[0] === 192 && octets[1] === 168) return false;
    // 169.254.x.x (link-local)
    if (octets[0] === 169 && octets[1] === 254) return false;
    // 0.0.0.0/8
    if (octets[0] === 0) return false;
  }

  // Block metadata endpoints (cloud providers)
  if (hostname === "metadata.google.internal" || hostname === "169.254.169.254") {
    return false;
  }

  // Block internal hostnames (no TLD)
  if (!hostname.includes(".")) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimiters.imageProxy(clientIP);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  if (!isAllowedImageUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Validate content type
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "";
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Not an image" },
        { status: 400 }
      );
    }

    // Check content length if available
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 413 }
      );
    }

    const buffer = await response.arrayBuffer();

    // Double-check size after download
    if (buffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 413 }
      );
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.apiError("GET /api/image-proxy", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
