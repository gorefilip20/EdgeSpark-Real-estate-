/**
 * EdgeSpark — Deal Routes
 * GET    /api/public/deals              — List active deals (public)
 * GET    /api/public/deals/:slug        — Deal detail with analyzer (public)
 * POST   /api/public/deals              — Create deal (admin)
 * PATCH  /api/public/deals/:id          — Update deal (admin)
 * DELETE /api/public/deals/:id          — Delete deal (admin)
 * POST   /api/public/deals/:id/interest — Expression of interest (auth)
 */

import { Hono } from "hono";
import { verifyToken } from "../lib/auth";

import { db, vars } from "edgespark";
import { deals, properties, investorInterests } from "../defs/db_schema";
import { eq, and, ne, desc, count, getTableColumns } from "drizzle-orm";

const routes = new Hono();

// ============================================
// LIST (public — active deals only)
// ============================================
routes.get("/", async (c) => {
  const status = c.req.query("status") || "active";
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 50);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  const results = await db
    .select({
      ...getTableColumns(deals),
      propertyTitle: properties.title,
      city: properties.city,
      address: properties.address,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      heroImage: properties.heroImage,
      propertyType: properties.propertyType,
    })
    .from(deals)
    .leftJoin(properties, eq(deals.propertyId, properties.id))
    .where(eq(deals.status, status as any))
    .orderBy(desc(deals.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ total: count() })
    .from(deals)
    .where(eq(deals.status, status as any));

  return c.json({
    ok: true,
    items: results,
    total: countRow?.total || 0,
  });
});

// ============================================
// DETAIL (public — by slug)
// ============================================
routes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [deal] = await db
    .select({
      ...getTableColumns(deals),
      propertyTitle: properties.title,
      city: properties.city,
      address: properties.address,
      latitude: properties.latitude,
      longitude: properties.longitude,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      plotSizeSqm: properties.plotSizeSqm,
      heroImage: properties.heroImage,
      galleryImages: properties.galleryImages,
      propertyType: properties.propertyType,
    })
    .from(deals)
    .leftJoin(properties, eq(deals.propertyId, properties.id))
    .where(eq(deals.slug, slug));

  if (!deal) return c.json({ error: "not_found" }, 404);

  const result = { ...deal } as Record<string, unknown>;
  if (typeof result.galleryImages === "string") {
    try { result.galleryImages = JSON.parse(result.galleryImages as string); }
    catch { result.galleryImages = []; }
  }
  if (typeof result.highlights === "string") {
    try { result.highlights = JSON.parse(result.highlights as string); }
    catch { result.highlights = []; }
  }

  return c.json({ ok: true, deal: result });
});

// ============================================
// CREATE (admin)
// ============================================
routes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const {
    propertyId, title, status, purchasePriceNgn, renovationCostsNgn,
    legalFeesNgn, totalInvestmentNgn, projectedResaleNgn, grossProfitNgn,
    returnPercentage, investorShareMin, investorShareMax, dealCycleMonths,
    description, highlights, riskNotes, targetCloseDate,
  } = body as Record<string, unknown>;

  if (!title || !purchasePriceNgn || !totalInvestmentNgn || !projectedResaleNgn || !grossProfitNgn) {
    return c.json({ error: "missing_required_fields" }, 400);
  }

  const id = crypto.randomUUID();
  const slug = (title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const now = new Date().toISOString();

  await db.insert(deals).values({
    id,
    propertyId: (propertyId as string) || null,
    title: title as string,
    slug,
    status: (status as any) || "draft",
    purchasePriceNgn: purchasePriceNgn as number,
    renovationCostsNgn: renovationCostsNgn as number,
    legalFeesNgn: (legalFeesNgn as number) || 0,
    totalInvestmentNgn: totalInvestmentNgn as number,
    projectedResaleNgn: projectedResaleNgn as number,
    grossProfitNgn: grossProfitNgn as number,
    returnPercentage: (returnPercentage as number) || null,
    investorShareMin: (investorShareMin as number) || null,
    investorShareMax: (investorShareMax as number) || null,
    dealCycleMonths: (dealCycleMonths as number) || null,
    description: (description as string) || null,
    highlights: highlights ? JSON.stringify(highlights) : null,
    riskNotes: (riskNotes as string) || null,
    targetCloseDate: (targetCloseDate as string) || null,
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
    "propertyId", "title", "status", "purchasePriceNgn", "renovationCostsNgn",
    "legalFeesNgn", "totalInvestmentNgn", "projectedResaleNgn", "grossProfitNgn",
    "returnPercentage", "investorShareMin", "investorShareMax", "dealCycleMonths",
    "description", "highlights", "riskNotes", "targetCloseDate",
  ]);

  const updates: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(body)) {
    if (allowed.has(key)) {
      if (key === "highlights") {
        updates[key] = JSON.stringify(val);
      } else {
        updates[key] = val;
      }
    }
  }

  if (Object.keys(updates).length === 0) return c.json({ error: "no_valid_fields" }, 400);

  updates.updatedAt = new Date().toISOString();

  await db.update(deals).set(updates as any).where(eq(deals.id, id));

  return c.json({ ok: true });
});

// ============================================
// DELETE (admin)
// ============================================
routes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await db.delete(deals).where(eq(deals.id, id));
  return c.json({ ok: true });
});

// ============================================
// EXPRESSION OF INTEREST (authenticated)
// ============================================
routes.post("/:id/interest", async (c) => {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return c.json({ error: "unauthenticated" }, 401);

  const payload = await verifyToken(token, vars.get("JWT_SECRET")!);
  if (!payload || typeof payload.sub !== "string") {
    return c.json({ error: "invalid_token" }, 401);
  }

  const dealId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const { message, amountIndicative } = (body || {}) as {
    message?: string;
    amountIndicative?: string;
  };

  // Check deal exists and is active
  const [deal] = await db
    .select({ id: deals.id, status: deals.status })
    .from(deals)
    .where(eq(deals.id, dealId));
  if (!deal) return c.json({ error: "deal_not_found" }, 404);
  if (deal.status !== "active") return c.json({ error: "deal_not_active" }, 400);

  // Check for duplicate
  const [existing] = await db
    .select({ id: investorInterests.id })
    .from(investorInterests)
    .where(
      and(
        eq(investorInterests.userId, payload.sub),
        eq(investorInterests.dealId, dealId),
        ne(investorInterests.status, "withdrawn"),
      )
    );
  if (existing) return c.json({ error: "already_expressed_interest" }, 409);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(investorInterests).values({
    id,
    userId: payload.sub,
    dealId,
    status: "pending",
    message: message || null,
    amountIndicative: amountIndicative || null,
    createdAt: now,
  }).returning();

  return c.json({ ok: true, interestId: id }, 201);
});

export default routes;
