import { NextResponse } from "next/server";
import { deleteAuthCookie } from "@/lib/cookies";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear the HttpOnly auth cookie
  response.headers.set("Set-Cookie", deleteAuthCookie());

  return response;
}
