/**
 * EdgeSpark — Main Application Entry
 * Hono + D1 + R2 + Bloome Bridge
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { installBloomeBridge } from "./bloome-bridge";
import { errorHandler, requestLogger, bodySanitizer } from "./lib/middleware";
import auth from "./routes/auth";
import properties from "./routes/properties";
import deals from "./routes/deals";
import contacts from "./routes/contacts";
import currency from "./routes/currency";
import content from "./routes/content";
import admin from "./routes/admin";
import partners from "./routes/partners";
import email from "./routes/email";
import staticRoutes from "./routes/static";

const app = new Hono();

// ============================================
// MIDDLEWARE
// ============================================
app.use("*", errorHandler);
app.use("*", requestLogger);
app.use("/api/*", bodySanitizer);
app.use(
  "/api/public/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================
// BRIDGE (Bloome identity)
// ============================================
installBloomeBridge(app);

// ============================================
// STATIC PAGES (landing page, etc.)
// ============================================
app.route("/api/public/page", staticRoutes);

// ============================================
// PUBLIC API ROUTES
// ============================================
app.route("/api/public/auth", auth);
app.route("/api/public/properties", properties);
app.route("/api/public/deals", deals);
app.route("/api/public/contacts", contacts);
app.route("/api/public/currency", currency);
app.route("/api/public/content", content);
app.route("/api/public/admin", admin);
app.route("/", partners);
app.route("/", email);

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (c) =>
  c.json({ ok: true, service: "edgespark-site", timestamp: new Date().toISOString() })
);

// ============================================
// 404 FALLBACK
// ============================================
app.notFound((c) => c.json({ error: "not_found", path: c.req.url }, 404));

// ============================================
// ERROR HANDLER
// ============================================
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "internal_error", message: err.message }, 500);
});

export default app;
