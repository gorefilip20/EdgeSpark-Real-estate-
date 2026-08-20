import { Hono } from "hono";
import { db } from "edgespark";
import { propertyMedia, properties } from "../defs/db_schema";
import { eq, asc } from "drizzle-orm";

const mediaRoutes = new Hono();

// ============================================
// GET /api/public/properties/:id/media
// List all media for a property
// ============================================
mediaRoutes.get("/api/public/properties/:id/media", async (c) => {
  const propertyId = c.req.param("id");
  
  const media = await db
    .select()
    .from(propertyMedia)
    .where(eq(propertyMedia.propertyId, propertyId))
    .orderBy(asc(propertyMedia.sortOrder));

  return c.json({ ok: true, items: media });
});

// ============================================
// POST /api/public/properties/:id/media
// Add media reference to property
// ============================================
mediaRoutes.post("/api/public/properties/:id/media", async (c) => {
  const propertyId = c.req.param("id");
  const { url, mediaType, fileName, fileSize, mimeType, caption, isHero } = await c.req.json();

  // Get current max sortOrder
  const existing = await db
    .select()
    .from(propertyMedia)
    .where(eq(propertyMedia.propertyId, propertyId));
  
  const maxSort = existing.reduce((max, m) => Math.max(max, m.sortOrder), 0);

  const [media] = await db
    .insert(propertyMedia)
    .values({
      id: crypto.randomUUID(),
      propertyId,
      mediaType: mediaType || "image",
      s3Uri: url || "",
      fileName,
      fileSize,
      mimeType,
      caption,
      sortOrder: maxSort + 1,
      isHero: isHero || false,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return c.json({ ok: true, media });
});

// ============================================
// DELETE /api/public/properties/:propertyId/media/:mediaId
// Remove media from property
// ============================================
mediaRoutes.delete("/api/public/properties/:propertyId/media/:mediaId", async (c) => {
  const mediaId = c.req.param("mediaId");
  await db.delete(propertyMedia).where(eq(propertyMedia.id, mediaId));
  return c.json({ ok: true });
});

// ============================================
// PATCH /api/public/properties/:propertyId/media/:mediaId
// Update media caption, hero status, or sort order
// ============================================
mediaRoutes.patch("/api/public/properties/:propertyId/media/:mediaId", async (c) => {
  const mediaId = c.req.param("mediaId");
  const updates = await c.req.json();

  const allowedFields: Record<string, any> = {};
  if (updates.caption !== undefined) allowedFields.caption = updates.caption;
  if (updates.isHero !== undefined) allowedFields.isHero = updates.isHero;
  if (updates.sortOrder !== undefined) allowedFields.sortOrder = updates.sortOrder;

  if (Object.keys(allowedFields).length > 0) {
    await db.update(propertyMedia).set(allowedFields).where(eq(propertyMedia.id, mediaId));
  }

  return c.json({ ok: true });
});

export default mediaRoutes;
