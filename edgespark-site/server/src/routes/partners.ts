import { Hono } from "hono";
import { db } from "edgespark";
import { partnerApplications } from "../defs/db_schema";
import { eq, desc } from "drizzle-orm";

const partnersRoutes = new Hono();

// ============================================
// POST /api/public/partners/apply
// Public partner application submission
// ============================================
partnersRoutes.post("/api/public/partners/apply", async (c) => {
  const { fullName, email, phone, company, investmentRange, experience, message } = await c.req.json();

  if (!fullName || !email) {
    return c.json({ error: "name_and_email_required" }, 400);
  }

  const now = new Date().toISOString();
  const [app] = await db
    .insert(partnerApplications)
    .values({
      id: crypto.randomUUID(),
      fullName,
      email,
      phone,
      company,
      investmentRange,
      experience,
      message,
      source: "website",
      status: "new",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json({ ok: true, application: { id: app.id } });
});

// ============================================
// GET /api/public/admin/partners
// List all partner applications (admin)
// ============================================
partnersRoutes.get("/api/public/admin/partners", async (c) => {
  const apps = await db
    .select()
    .from(partnerApplications)
    .orderBy(desc(partnerApplications.createdAt));

  return c.json({ ok: true, items: apps, total: apps.length });
});

// ============================================
// PATCH /api/public/admin/partners/:id
// Update partner application status/notes (admin)
// ============================================
partnersRoutes.patch("/api/public/admin/partners/:id", async (c) => {
  const id = c.req.param("id");
  const { status, adminNotes } = await c.req.json();

  const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (status) updates.status = status;
  if (adminNotes !== undefined) updates.adminNotes = adminNotes;

  await db.update(partnerApplications).set(updates).where(eq(partnerApplications.id, id));

  return c.json({ ok: true });
});

export default partnersRoutes;
