import { NextResponse } from "next/server";
import { baserow } from "@/lib/baserow";
import { verifyPassword, generateToken } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIP, getRateLimitHeaders } from "@/lib/rate-limit";
import { createAuthCookie } from "@/lib/cookies";
import type { LoginCredentials } from "@/types";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiters.auth(clientIP);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const baserowUser = await baserow.getUserByEmail(email);
    if (!baserowUser) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, baserowUser.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const user = {
      id: baserowUser.id,
      email: baserowUser.email,
      name: baserowUser.name,
      created_at: baserowUser.created_at,
    };
    const token = await generateToken(user);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user,
        },
      }
    );

    // Set HttpOnly cookie for secure token storage
    response.headers.set("Set-Cookie", createAuthCookie(token));

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (error) {
    logger.apiError("POST /api/auth/login", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
