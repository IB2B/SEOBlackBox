import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload, User } from "@/types";

// Validate JWT_SECRET - must be set in production
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: JWT_SECRET environment variable is required in production");
    }
    // Use dev-only fallback
    // Dev-only fallback - production requires JWT_SECRET env var
    return new TextEncoder().encode("dev-only-secret-key-min-32-characters-long");
  }

  // Validate secret length
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export async function getUserFromRequest(
  request: Request
): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
