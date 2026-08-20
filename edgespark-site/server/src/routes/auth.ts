/**
 * EdgeSpark — Auth Routes
 * POST /api/public/auth/register
 * POST /api/public/auth/login
 * GET  /api/public/auth/me
 */

import { Hono } from "hono";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { db, vars } from "edgespark";
import { users } from "../defs/db_schema";
import { eq } from "drizzle-orm";

const auth = new Hono();

// ============================================
// REGISTER
// ============================================
auth.post("/register", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const { email, password, name, phone } = body as {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
  };

  if (!email || !password || !name) {
    return c.json({ error: "missing_fields", fields: ["email", "password", "name"] }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "password_too_short", min: 8 }, 400);
  }

  // Check existing user
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));
  if (existing) {
    return c.json({ error: "email_already_registered" }, 409);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id,
    email: email.toLowerCase().trim(),
    passwordHash,
    name,
    phone: phone || null,
    role: "investor",
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  }).returning();

  const token = await signToken({ sub: id, email, name, role: "investor" }, vars.get("JWT_SECRET")!);

  return c.json({
    ok: true,
    user: { id, email, name, role: "investor" },
    token,
  }, 201);
});

// ============================================
// LOGIN
// ============================================
auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const { email, password } = body as { email?: string; password?: string };
  if (!email || !password) {
    return c.json({ error: "missing_fields", fields: ["email", "password"] }, 400);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (!user) {
    return c.json({ error: "invalid_credentials" }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "invalid_credentials" }, 401);
  }

  const token = await signToken(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    vars.get("JWT_SECRET")!
  );

  return c.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
});

// ============================================
// ME (requires auth)
// ============================================
auth.get("/me", async (c) => {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return c.json({ error: "unauthenticated" }, 401);

  const payload = await verifyToken(token, vars.get("JWT_SECRET")!);
  if (!payload || typeof payload.sub !== "string") {
    return c.json({ error: "invalid_token" }, 401);
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub));

  if (!user) return c.json({ error: "user_not_found" }, 404);

  return c.json({ ok: true, user });
});

export default auth;
