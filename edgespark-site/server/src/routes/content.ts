/**
 * EdgeSpark — Site Content (CMS) Routes
 * GET    /api/public/content            — Get all content (public, for rendering)
 * GET    /api/public/content/:key       — Get single key
 * PUT    /api/public/content/:key       — Update content (admin)
 * PUT    /api/public/content/batch      — Batch update (admin)
 */

import { Hono } from "hono";

import { db } from "edgespark";
import { siteContent } from "../defs/db_schema";
import { eq, and } from "drizzle-orm";

const routes = new Hono();

// ============================================
// GET ALL (public)
// ============================================
routes.get("/", async (c) => {
  const section = c.req.query("section");

  const conditions = [];
  if (section) {
    conditions.push(eq(siteContent.section, section));
  }

  const results = await db
    .select()
    .from(siteContent)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Return as key-value map
  const map: Record<string, string> = {};
  for (const row of results) {
    map[row.key] = row.value;
  }

  return c.json({ ok: true, content: map });
});

// ============================================
// GET SINGLE KEY (public)
// ============================================
routes.get("/:key", async (c) => {
  const key = c.req.param("key");
  const [row] = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, key));

  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true, content: row });
});

// ============================================
// UPDATE SINGLE KEY (admin)
// ============================================
routes.put("/:key", async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.value !== "string") {
    return c.json({ error: "missing_value" }, 400);
  }

  const now = new Date().toISOString();

  // Upsert
  await db
    .insert(siteContent)
    .values({
      key,
      value: body.value,
      section: body.section || null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: {
        value: body.value,
        section: body.section || null,
        updatedAt: now,
      },
    });

  return c.json({ ok: true });
});

// ============================================
// BATCH UPDATE (admin)
// ============================================
routes.put("/batch", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.items !== "object") {
    return c.json({ error: "missing_items" }, 400);
  }

  const now = new Date().toISOString();
  const entries = Object.entries(body.items as Record<string, string>);

  const batch = entries.map(([key, value]) =>
    db
      .insert(siteContent)
      .values({
        key,
        value,
        section: body.section || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: {
          value,
          section: body.section || null,
          updatedAt: now,
        },
      })
  );

  await db.batch(batch as any);

  return c.json({ ok: true, updated: batch.length });
});

export default routes;
