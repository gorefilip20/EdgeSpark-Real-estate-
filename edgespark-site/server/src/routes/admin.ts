/**
 * EdgeSpark — Admin Routes
 * GET /api/public/admin/dashboard    — Dashboard stats
 * GET /api/public/admin/interests    — List investor interests
 * PATCH /api/public/admin/interests/:id — Update interest status
 * GET /api/public/admin/users        — List users
 */

import { Hono } from "hono";

import { db } from "edgespark";
import { properties, deals, contacts, investorInterests, users } from "../defs/db_schema";
import { eq, and, sql, desc, count, getTableColumns } from "drizzle-orm";

const routes = new Hono();

// ============================================
// DASHBOARD STATS
// ============================================
routes.get("/dashboard", async (c) => {
  const [propertiesStats, dealsStats, contactsStats, interestsStats, usersStats] =
    await Promise.all([
      db
        .select({
          total: count(),
          active: sql<number>`COALESCE(SUM(CASE WHEN ${properties.status} = ${"available"} THEN 1 ELSE 0 END), 0)`,
        })
        .from(properties),
      db
        .select({
          total: count(),
          active: sql<number>`COALESCE(SUM(CASE WHEN ${deals.status} = ${"active"} THEN 1 ELSE 0 END), 0)`,
          completed: sql<number>`COALESCE(SUM(CASE WHEN ${deals.status} = ${"completed"} THEN 1 ELSE 0 END), 0)`,
        })
        .from(deals),
      db
        .select({
          total: count(),
          newCount: sql<number>`COALESCE(SUM(CASE WHEN ${contacts.status} = ${"new"} THEN 1 ELSE 0 END), 0)`,
        })
        .from(contacts),
      db
        .select({
          total: count(),
          pending: sql<number>`COALESCE(SUM(CASE WHEN ${investorInterests.status} = ${"pending"} THEN 1 ELSE 0 END), 0)`,
        })
        .from(investorInterests),
      db
        .select({ total: count() })
        .from(users),
    ]);

  return c.json({
    ok: true,
    stats: {
      properties: {
        total: propertiesStats[0]?.total || 0,
        active: propertiesStats[0]?.active || 0,
      },
      deals: {
        total: dealsStats[0]?.total || 0,
        active: dealsStats[0]?.active || 0,
        completed: dealsStats[0]?.completed || 0,
      },
      contacts: {
        total: contactsStats[0]?.total || 0,
        new: contactsStats[0]?.newCount || 0,
      },
      interests: {
        total: interestsStats[0]?.total || 0,
        pending: interestsStats[0]?.pending || 0,
      },
      users: { total: usersStats[0]?.total || 0 },
    },
  });
});

// ============================================
// INVESTOR INTERESTS
// ============================================
routes.get("/interests", async (c) => {
  const status = c.req.query("status");
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  const results = await db
    .select({
      ...getTableColumns(investorInterests),
      userName: users.name,
      userEmail: users.email,
      dealTitle: deals.title,
      dealSlug: deals.slug,
    })
    .from(investorInterests)
    .leftJoin(users, eq(investorInterests.userId, users.id))
    .leftJoin(deals, eq(investorInterests.dealId, deals.id))
    .where(status ? eq(investorInterests.status, status as any) : undefined)
    .orderBy(desc(investorInterests.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ ok: true, items: results });
});

routes.patch("/interests/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  if (!body?.status) return c.json({ error: "missing_status" }, 400);

  const validStatuses = ["pending", "reviewed", "approved", "declined", "withdrawn"];
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: "invalid_status" }, 400);
  }

  const now = new Date().toISOString();
  await db
    .update(investorInterests)
    .set({ status: body.status, reviewedAt: now })
    .where(eq(investorInterests.id, id));

  return c.json({ ok: true });
});

// ============================================
// USERS LIST
// ============================================
routes.get("/users", async (c) => {
  const role = c.req.query("role");
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  const results = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(role ? eq(users.role, role as any) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ ok: true, items: results });
});

export default routes;
