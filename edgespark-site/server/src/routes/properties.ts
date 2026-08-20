/**
 * EdgeSpark — Property Routes
 * GET    /api/public/properties                    — List (public)
 * GET    /api/public/properties/:slug              — Detail (public)
 * POST   /api/public/properties                    — Create (admin)
 * PATCH  /api/public/properties/:id                — Update (admin)
 * DELETE /api/public/properties/:id                — Delete (admin)
 * GET    /api/public/properties/:id/media          — List media
 * POST   /api/public/properties/:id/media          — Add media (JSON)
 * POST   /api/public/properties/:id/media/upload   — Upload media file (multipart)
 * POST   /api/public/properties/:id/media/presign  — Get presigned upload URL
 * GET    /api/public/properties/:id/media/:mid/url  — Get presigned download URL
 * DELETE /api/public/properties/:pid/media/:mid    — Delete media
 * PATCH  /api/public/properties/:pid/media/:mid    — Update media
 */

import { Hono } from "hono";
import { db, storage } from "edgespark";
import { properties, propertyMedia } from "../defs/db_schema";
import { mediaBucket } from "../defs/storage_schema";
import { eq, and, desc, count, asc } from "drizzle-orm";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const routes = new Hono();

// ============================================
// LIST (public — published properties only)
// ============================================
routes.get("/", async (c) => {
  const status = c.req.query("status") || "available";
  const featured = c.req.query("featured");
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 50);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  const conditions = [eq(properties.status, status as any)];
  if (featured === "true") {
    conditions.push(eq(properties.featured, true));
  }

  const results = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(properties)
    .where(eq(properties.status, status as any));

  return c.json({
    ok: true,
    items: results,
    total: countRow?.total || 0,
    limit,
    offset,
  });
});

// ============================================
// DETAIL (public — by slug)
// ============================================
routes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, slug));

  if (!property) return c.json({ error: "not_found" }, 404);

  const result = { ...property } as Record<string, unknown>;
  if (typeof result.galleryImages === "string") {
    try { result.galleryImages = JSON.parse(result.galleryImages as string); } catch { result.galleryImages = []; }
  }

  return c.json({ ok: true, property: result });
});

// ============================================
// CREATE (admin)
// ============================================
routes.post("/", async (c) => {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return c.json({ error: "unauthenticated" }, 401);

  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const {
    title, description, status, address, city, state, country,
    latitude, longitude, bedrooms, bathrooms, plot_size_sqm, buildingSizeSqm,
    property_type, price_ngn, priceNote, heroImage, galleryImages, featured,
  } = body as Record<string, unknown>;

  if (!title || !address || !city || !state || !price_ngn) {
    return c.json({ error: "missing_required_fields" }, 400);
  }

  const id = crypto.randomUUID();
  const slug = (title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const now = new Date().toISOString();

  await db.insert(properties).values({
    id,
    title: title as string,
    slug,
    description: description as string || null,
    status: (status as any) || "draft",
    address: address as string,
    city: city as string,
    state: state as string,
    country: (country as string) || "Nigeria",
    latitude: (latitude as number) || null,
    longitude: (longitude as number) || null,
    bedrooms: (bedrooms as number) || null,
    bathrooms: (bathrooms as number) || null,
    plotSizeSqm: (plot_size_sqm as number) || null,
    buildingSizeSqm: (buildingSizeSqm as number) || null,
    propertyType: (property_type as any) || null,
    priceNgn: price_ngn as number,
    priceNote: (priceNote as string) || null,
    heroImage: (heroImage as string) || null,
    galleryImages: galleryImages ? JSON.stringify(galleryImages) : null,
    featured: !!featured,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return c.json({ ok: true, id, slug }, 201);
});

// ============================================
// UPDATE (admin)
// ============================================
routes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const allowed = new Set([
    "title", "description", "status", "address", "city", "state", "country",
    "latitude", "longitude", "bedrooms", "bathrooms", "plot_size_sqm",
    "buildingSizeSqm", "property_type", "price_ngn", "priceNote",
    "heroImage", "galleryImages", "featured",
  ]);

  const updates: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(body)) {
    if (allowed.has(key)) {
      if (key === "galleryImages") updates[key] = JSON.stringify(val);
      else if (key === "featured") updates[key] = !!val;
      else updates[key] = val;
    }
  }

  if (Object.keys(updates).length === 0) return c.json({ error: "no_valid_fields" }, 400);
  updates.updatedAt = new Date().toISOString();
  await db.update(properties).set(updates as any).where(eq(properties.id, id));
  return c.json({ ok: true });
});

// ============================================
// DELETE (admin)
// ============================================
routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(properties).where(eq(properties.id, id));
  return c.json({ ok: true });
});

// ============================================
// MEDIA — List all media for a property
// ============================================
routes.get("/:id/media", async (c) => {
  const propertyId = c.req.param("id");
  const media = await db
    .select()
    .from(propertyMedia)
    .where(eq(propertyMedia.propertyId, propertyId))
    .orderBy(asc(propertyMedia.sortOrder));
  return c.json({ ok: true, items: media });
});

// ============================================
// MEDIA — Add media to property
// ============================================
routes.post("/:id/media", async (c) => {
  const propertyId = c.req.param("id");
  const { url, mediaType, fileName, fileSize, mimeType, caption, isHero } = await c.req.json();

  const existing = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyId, propertyId));
  const maxSort = existing.reduce((max, m) => Math.max(max, m.sortOrder), 0);

  const [media] = await db.insert(propertyMedia).values({
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
  }).returning();

  return c.json({ ok: true, media });
});

// ============================================
// MEDIA — Delete media
// ============================================
routes.delete("/:pid/media/:mid", async (c) => {
  const mediaId = c.req.param("mid");
  await db.delete(propertyMedia).where(eq(propertyMedia.id, mediaId));
  return c.json({ ok: true });
});

// ============================================
// MEDIA — Update media
// ============================================
routes.patch("/:pid/media/:mid", async (c) => {
  const mediaId = c.req.param("mid");
  const updates = await c.req.json();
  const allowed: Record<string, any> = {};
  if (updates.caption !== undefined) allowed.caption = updates.caption;
  if (updates.isHero !== undefined) allowed.isHero = updates.isHero;
  if (updates.sortOrder !== undefined) allowed.sortOrder = updates.sortOrder;
  if (Object.keys(allowed).length > 0) {
    await db.update(propertyMedia).set(allowed).where(eq(propertyMedia.id, mediaId));
  }
  return c.json({ ok: true });
});

// ============================================
// MEDIA — Upload file (multipart/form-data)
// ============================================
routes.post("/:id/media/upload", async (c) => {
  const propertyId = c.req.param("id");

  const formData = await c.req.formData().catch(() => null);
  if (!formData) return c.json({ error: "invalid_form_data" }, 400);

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return c.json({ error: "missing_file" }, 400);
  }

  const mimeType = file.type;
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

  if (!isImage && !isVideo) {
    return c.json({
      error: "unsupported_file_type",
      allowed: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
    }, 400);
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return c.json({
      error: "file_too_large",
      maxBytes: maxSize,
      receivedBytes: file.size,
    }, 400);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
  const storagePath = `properties/${propertyId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const bucket = storage.from(mediaBucket);
  await bucket.put(storagePath, arrayBuffer, { contentType: mimeType });

  const s3Uri = storage.createS3Uri(mediaBucket, storagePath);

  const existing = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyId, propertyId));
  const maxSort = existing.reduce((max, m) => Math.max(max, m.sortOrder), 0);

  const caption = formData.get("caption")?.toString() || null;
  const isHero = formData.get("isHero")?.toString() === "true";

  const mediaId = crypto.randomUUID();
  const [media] = await db.insert(propertyMedia).values({
    id: mediaId,
    propertyId,
    mediaType: isVideo ? "video" : "image",
    s3Uri,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    caption,
    sortOrder: maxSort + 1,
    isHero,
    createdAt: new Date().toISOString(),
  }).returning();

  return c.json({ ok: true, media }, 201);
});

// ============================================
// MEDIA — Presigned upload URL (for large files)
// ============================================
routes.post("/:id/media/presign", async (c) => {
  const propertyId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const { fileName, mimeType } = body as { fileName?: string; mimeType?: string };
  if (!fileName || !mimeType) {
    return c.json({ error: "missing_fileName_or_mimeType" }, 400);
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  if (!isImage && !isVideo) {
    return c.json({ error: "unsupported_file_type" }, 400);
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
  const storagePath = `properties/${propertyId}/${crypto.randomUUID()}.${ext}`;

  const bucket = storage.from(mediaBucket);
  const { uploadUrl, requiredHeaders, expiresAt } = await bucket.createPresignedPutUrl(
    storagePath,
    3600,
    { contentType: mimeType },
  );

  return c.json({
    ok: true,
    uploadUrl,
    requiredHeaders,
    expiresAt: expiresAt.toISOString(),
    storagePath,
    s3Uri: storage.createS3Uri(mediaBucket, storagePath),
    mediaType: isVideo ? "video" : "image",
  });
});

// ============================================
// MEDIA — Get download URL for S3 media
// ============================================
routes.get("/:id/media/:mid/url", async (c) => {
  const mediaId = c.req.param("mid");
  const [mediaRow] = await db
    .select()
    .from(propertyMedia)
    .where(eq(propertyMedia.id, mediaId));

  if (!mediaRow) return c.json({ error: "not_found" }, 404);

  const parsed = storage.tryParseS3Uri(mediaRow.s3Uri);
  if (!parsed) return c.json({ error: "invalid_storage_ref" }, 500);

  const bucket = storage.from(parsed.bucket as any);
  const { downloadUrl, expiresAt } = await bucket.createPresignedGetUrl(parsed.path, 3600);

  return c.json({ ok: true, downloadUrl, expiresAt: expiresAt.toISOString() });
});

export default routes;
