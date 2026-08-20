/**
 * EdgeSpark — Contact Routes
 * POST /api/public/contacts  — Submit contact form (public)
 * GET  /api/public/contacts  — List contacts (admin)
 */

import { Hono } from "hono";

import { db } from "edgespark";
import { contacts } from "../defs/db_schema";
import { eq, and, desc } from "drizzle-orm";

const routes = new Hono();

// ============================================
// SUBMIT (public)
// ============================================
routes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const { name, email, phone, interestRange, message } = body as {
    name?: string;
    email?: string;
    phone?: string;
    interestRange?: string;
    message?: string;
  };

  if (!name || !email) {
    return c.json({ error: "missing_fields", fields: ["name", "email"] }, 400);
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "invalid_email" }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(contacts).values({
    id,
    name,
    email: email.toLowerCase().trim(),
    phone: phone || null,
    interestRange: interestRange || null,
    message: message || null,
    source: "website",
    status: "new",
    createdAt: now,
  }).returning();

  return c.json({ ok: true, id }, 201);
});

// ============================================
// LIST (admin)
// ============================================
routes.get("/", async (c) => {
  const status = c.req.query("status");
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  const conditions = [];
  if (status) {
    conditions.push(eq(contacts.status, status as any));
  }

  const results = await db
    .select()
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ ok: true, items: results });
});

// ============================================
// UPDATE STATUS (admin)
// ============================================
routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  if (!body?.status) return c.json({ error: "missing_status" }, 400);

  const validStatuses = ["new", "contacted", "qualified", "archived"];
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: "invalid_status" }, 400);
  }

  await db.update(contacts).set({ status: body.status }).where(eq(contacts.id, id));

  return c.json({ ok: true });
});

export default routes;
