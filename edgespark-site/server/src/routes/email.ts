import { Hono } from "hono";
import { db } from "edgespark";
import { emailLogs } from "../defs/db_schema";
import { desc } from "drizzle-orm";

const emailRoutes = new Hono();

// ============================================
// POST /api/public/admin/email/send
// Log an email reply (admin)
// ============================================
emailRoutes.post("/api/public/admin/email/send", async (c) => {
  const { toEmail, subject, body, relatedType, relatedId } = await c.req.json();

  if (!toEmail || !subject || !body) {
    return c.json({ error: "to_email_subject_body_required" }, 400);
  }

  const [log] = await db
    .insert(emailLogs)
    .values({
      id: crypto.randomUUID(),
      toEmail,
      fromEmail: "admin@edgespark.com",
      subject,
      body,
      relatedType,
      relatedId,
      status: "sent",
      createdAt: new Date().toISOString(),
    })
    .returning();

  console.log(`[EMAIL] To: ${toEmail}, Subject: ${subject}`);

  return c.json({ ok: true, emailLog: log });
});

// ============================================
// GET /api/public/admin/email/logs
// List all sent emails (admin)
// ============================================
emailRoutes.get("/api/public/admin/email/logs", async (c) => {
  const logs = await db
    .select()
    .from(emailLogs)
    .orderBy(desc(emailLogs.createdAt));

  return c.json({ ok: true, items: logs, total: logs.length });
});

export default emailRoutes;
