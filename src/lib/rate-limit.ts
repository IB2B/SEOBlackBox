/**
 * Sliding window rate limiter for API routes.
 * Uses a sliding window log approach for more accurate rate limiting.
 * For production at scale, consider using Redis.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// Store timestamps of requests per key
const requestLog = new Map<string, number[]>();

// Max store size to prevent memory exhaustion
const MAX_KEYS = 10000;

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  requestLog.forEach((timestamps, key) => {
    // Remove entries where all timestamps are expired (using max common window of 5 min)
    const recentTimestamps = timestamps.filter((t) => now - t < 300000);
    if (recentTimestamps.length === 0) {
      keysToDelete.push(key);
    } else {
      requestLog.set(key, recentTimestamps);
    }
  });
  keysToDelete.forEach((key) => requestLog.delete(key));
}, 60000);

/**
 * Check if a request should be rate limited using a sliding window.
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Prevent memory exhaustion
  if (!requestLog.has(identifier) && requestLog.size >= MAX_KEYS) {
    // Evict oldest key
    const firstKey = requestLog.keys().next().value;
    if (firstKey) requestLog.delete(firstKey);
  }

  // Get or create timestamps array
  let timestamps = requestLog.get(identifier) || [];

  // Remove timestamps outside the current window
  timestamps = timestamps.filter((t) => t > windowStart);

  // Check if over limit
  if (timestamps.length >= config.maxRequests) {
    // Find when the oldest request in the window will expire
    const oldestInWindow = timestamps[0];
    const resetTime = oldestInWindow + config.windowMs;

    requestLog.set(identifier, timestamps);

    return {
      success: false,
      remaining: 0,
      resetTime,
    };
  }

  // Add current request
  timestamps.push(now);
  requestLog.set(identifier, timestamps);

  return {
    success: true,
    remaining: config.maxRequests - timestamps.length,
    resetTime: now + config.windowMs,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    const ip = forwardedFor.split(",")[0].trim();
    // Basic validation - must look like an IP
    if (/^[\d.:a-fA-F]+$/.test(ip)) {
      return ip;
    }
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP && /^[\d.:a-fA-F]+$/.test(realIP)) {
    return realIP;
  }

  // Fallback for local development
  return "127.0.0.1";
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Auth endpoints: 5 requests per minute */
  auth: (identifier: string) =>
    rateLimit(`auth:${identifier}`, { maxRequests: 5, windowMs: 60000 }),

  /** Strict auth (login failures): 3 requests per 5 minutes */
  authStrict: (identifier: string) =>
    rateLimit(`auth-strict:${identifier}`, {
      maxRequests: 3,
      windowMs: 300000,
    }),

  /** API endpoints: 100 requests per minute */
  api: (identifier: string) =>
    rateLimit(`api:${identifier}`, { maxRequests: 100, windowMs: 60000 }),

  /** Heavy operations: 10 requests per minute */
  heavy: (identifier: string) =>
    rateLimit(`heavy:${identifier}`, { maxRequests: 10, windowMs: 60000 }),

  /** Image proxy: 30 requests per minute */
  imageProxy: (identifier: string) =>
    rateLimit(`image-proxy:${identifier}`, {
      maxRequests: 30,
      windowMs: 60000,
    }),
};
