/**
 * EdgeSpark — Middleware Stack
 * Error handler, request logger, body sanitizer, rate limiter
 */

import type { Context, Next } from "hono";

// ============================================
// HELPERS
// ============================================

function stripHtmlTags(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/<[^>]*>/g, "");
  }
  if (Array.isArray(value)) {
    return value.map(stripHtmlTags);
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = stripHtmlTags(val);
    }
    return result;
  }
  return value;
}

// ============================================
// ERROR HANDLER
// ============================================

export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);
    return c.json({ ok: false, error: "internal_error" }, 500);
  }
}

// ============================================
// REQUEST LOGGER
// ============================================

export async function requestLogger(c: Context, next: Next): Promise<void> {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const status = c.res?.status || 0;
  console.log(`${c.req.method} ${c.req.path} ${status} ${duration}ms`);
}

// ============================================
// BODY SANITIZER
// Strips HTML tags from all string fields in
// JSON request bodies (POST, PATCH, PUT only).
// ============================================

export async function bodySanitizer(c: Context, next: Next): Promise<void> {
  const method = c.req.method;
  if (method === "POST" || method === "PATCH" || method === "PUT") {
    const contentType = c.req.header("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const cloned = c.req.raw.clone();
        const body = await cloned.json();
        const sanitized = stripHtmlTags(body);
        const newReq = new Request(c.req.raw.url, {
          method: c.req.raw.method,
          headers: c.req.raw.headers,
          body: JSON.stringify(sanitized),
        });
        (c.req as any).raw = newReq;
        if ((c.req as any).bodyCache) {
          (c.req as any).bodyCache = {};
        }
      } catch {
        // Not valid JSON or empty body — let route handler deal with it
      }
    }
  }
  await next();
}

// ============================================
// RATE LIMITER
// In-memory Map-based rate limiter factory.
// Tracks by client IP address.
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();

  return async (c: Context, next: Next): Promise<Response | void> => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return c.json({ error: "rate_limited" }, 429);
    }

    await next();
  };
}
