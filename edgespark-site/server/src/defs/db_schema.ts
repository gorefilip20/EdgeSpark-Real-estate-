/**
 * EdgeSpark — Application Database Schema
 * D1 (SQLite) via Drizzle ORM
 *
 * Tables: users, deals, properties, contacts, investor_interests, site_content, deal_analyzers
 */

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============================================
// USERS — Registration + Auth + Roles
// ============================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // UUID
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["admin", "investor"] })
    .notNull()
    .default("investor"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at").notNull(), // ISO 8601
  updatedAt: text("updated_at").notNull(),
});

// ============================================
// PROPERTIES — Buildings with location + map
// ============================================
export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  status: text("status", {
    enum: ["draft", "available", "under_offer", "sold", "archived"],
  })
    .notNull()
    .default("draft"),

  // Location
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("Nigeria"),
  latitude: real("latitude"),
  longitude: real("longitude"),

  // Property details
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  plotSizeSqm: integer("plot_size_sqm"),
  buildingSizeSqm: integer("building_size_sqm"),
  propertyType: text("property_type", {
    enum: ["bungalow", "duplex", "apartment", "land", "commercial", "other"],
  }),

  // Pricing (stored in NGN, converted on display)
  priceNgn: integer("price_ngn").notNull(),
  priceNote: text("price_note"), // e.g. "Below-market acquisition"

  // Images (R2 keys)
  heroImage: text("hero_image"), // R2 key for primary image
  galleryImages: text("gallery_images"), // JSON array of R2 keys

  // Meta
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============================================
// DEALS — Investment opportunities
// ============================================
export const deals = sqliteTable("deals", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").references(() => properties.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", {
    enum: [
      "draft",
      "active",
      "under_review",
      "funded",
      "completed",
      "cancelled",
    ],
  })
    .notNull()
    .default("draft"),

  // Deal economics (NGN)
  purchasePriceNgn: integer("purchase_price_ngn").notNull(),
  renovationCostsNgn: integer("renovation_costs_ngn").notNull(),
  legalFeesNgn: integer("legal_fees_ngn").notNull().default(0),
  totalInvestmentNgn: integer("total_investment_ngn").notNull(),
  projectedResaleNgn: integer("projected_resale_ngn").notNull(),
  grossProfitNgn: integer("gross_profit_ngn").notNull(),
  returnPercentage: real("return_percentage"), // e.g. 37.0

  // JV terms
  investorShareMin: integer("investor_share_min"), // e.g. 60
  investorShareMax: integer("investor_share_max"), // e.g. 80
  dealCycleMonths: integer("deal_cycle_months"), // e.g. 3

  // Content
  description: text("description"),
  highlights: text("highlights"), // JSON array of strings
  riskNotes: text("risk_notes"),

  // Dates
  targetCloseDate: text("target_close_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============================================
// INVESTOR INTERESTS — Expression of interest
// ============================================
export const investorInterests = sqliteTable("investor_interests", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  dealId: text("deal_id")
    .references(() => deals.id)
    .notNull(),
  status: text("status", {
    enum: ["pending", "reviewed", "approved", "declined", "withdrawn"],
  })
    .notNull()
    .default("pending"),
  message: text("message"), // Investor's note
  amountIndicative: text("amount_indicative"), // e.g. "$10,000-$50,000"
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull(),
});

// ============================================
// CONTACTS — Form submissions (public)
// ============================================
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  interestRange: text("interest_range"), // e.g. "$10,000-$50,000"
  message: text("message"),
  source: text("source").default("website"), // website, admin, referral
  status: text("status", {
    enum: ["new", "contacted", "qualified", "archived"],
  })
    .notNull()
    .default("new"),
  createdAt: text("created_at").notNull(),
});

// ============================================
// PROPERTY MEDIA — Photos + Videos per property
// ============================================
export const propertyMedia = sqliteTable("property_media", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .references(() => properties.id)
    .notNull(),
  mediaType: text("media_type", { enum: ["image", "video"] })
    .notNull(),
  s3Uri: text("s3_uri").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  isHero: integer("is_hero", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

// ============================================
// PARTNER APPLICATIONS — Pitch deck / JV interest
// ============================================
export const partnerApplications = sqliteTable("partner_applications", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  investmentRange: text("investment_range"),
  experience: text("experience"),
  message: text("message"),
  source: text("source").default("website"),
  status: text("status", {
    enum: ["new", "reviewed", "contacted", "approved", "declined"],
  })
    .notNull()
    .default("new"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ============================================
// EMAIL LOGS — Admin replies to inquiries
// ============================================
export const emailLogs = sqliteTable("email_logs", {
  id: text("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  fromEmail: text("from_email").notNull().default("admin@edgespark.com"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  relatedType: text("related_type"),
  relatedId: text("related_id"),
  status: text("status", { enum: ["sent", "failed", "pending"] })
    .notNull()
    .default("sent"),
  createdAt: text("created_at").notNull(),
});

// ============================================
// SITE CONTENT — CMS (admin-editable)
// ============================================
export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(), // e.g. "hero.title", "hero.description"
  value: text("value").notNull(),
  section: text("section"), // e.g. "hero", "opportunity", "footer"
  updatedAt: text("updated_at").notNull(),
});
