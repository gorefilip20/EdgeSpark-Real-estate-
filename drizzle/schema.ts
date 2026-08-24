import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const localAccounts = mysqlTable("localAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const internationalProspects = mysqlTable("internationalProspects", {
  id: int("id").autoincrement().primaryKey(),
  placeId: varchar("placeId", { length: 180 }).notNull().unique(),
  region: varchar("region", { length: 32 }).notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  status: mysqlEnum("status", ["new", "researching", "contacted", "meeting", "won", "archived"]).default("new").notNull(),
  notes: text("notes"),
  pitchAngle: text("pitchAngle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const internationalProspectContacts = mysqlTable("internationalProspectContacts", {
  id: int("id").autoincrement().primaryKey(),
  prospectId: int("prospectId").notNull().unique(),
  contactName: varchar("contactName", { length: 180 }),
  contactRole: varchar("contactRole", { length: 180 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 80 }),
  website: text("website"),
  bookingUrl: text("bookingUrl"),
  sourceUrl: text("sourceUrl"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  meetingAt: timestamp("meetingAt"),
  meetingNotes: text("meetingNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["draft", "available", "under_offer", "sold", "off_market"]).default("draft").notNull(),
  propertyType: mysqlEnum("propertyType", ["apartment", "duplex", "bungalow", "land", "commercial", "other"]).default("other").notNull(),
  address: varchar("address", { length: 240 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).default("Nigeria").notNull(),
  neighborhood: varchar("neighborhood", { length: 160 }),
  agentName: varchar("agentName", { length: 160 }),
  agentWhatsapp: varchar("agentWhatsapp", { length: 40 }),
  developerName: varchar("developerName", { length: 180 }),
  developerWhatsapp: varchar("developerWhatsapp", { length: 40 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  price: int("price").notNull(),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  areaSqm: int("areaSqm"),
  projectedRoi: decimal("projectedRoi", { precision: 5, scale: 2 }),
  projectedYield: decimal("projectedYield", { precision: 5, scale: 2 }),
  featured: int("featured").default(0).notNull(),
  published: int("published").default(0).notNull(),
  isDemo: int("isDemo").default(0).notNull(),
  sourceLabel: varchar("sourceLabel", { length: 180 }),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "under_review", "verified"]).default("unverified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  notes: text("notes"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const propertyMedia = mysqlTable("propertyMedia", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  url: text("url").notNull(),
  storageKey: text("storageKey").notNull(),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 120 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isHero: int("isHero").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId"),
  userId: int("userId"),
  propertyTitle: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leadStatusHistory = mysqlTable("leadStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  leadType: mysqlEnum("leadType", ["inquiry", "partnership"]).notNull(),
  leadId: int("leadId").notNull(),
  fromStatus: varchar("fromStatus", { length: 40 }),
  toStatus: varchar("toStatus", { length: 40 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const partnershipApplications = mysqlTable("partnershipApplications", {
  id: int("id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["investor", "owner", "agent", "developer", "realtor"]).notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  company: varchar("company", { length: 180 }),
  investmentRange: varchar("investmentRange", { length: 120 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "contacted", "approved", "declined"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ many }) => ({ media: many(propertyMedia), inquiries: many(inquiries), favorites: many(favorites) }));
export const favoritesRelations = relations(favorites, ({ one }) => ({ property: one(properties, { fields: [favorites.propertyId], references: [properties.id] }), user: one(users, { fields: [favorites.userId], references: [users.id] }) }));
export const propertyMediaRelations = relations(propertyMedia, ({ one }) => ({ property: one(properties, { fields: [propertyMedia.propertyId], references: [properties.id] }) }));
export const inquiryRelations = relations(inquiries, ({ one }) => ({ property: one(properties, { fields: [inquiries.propertyId], references: [properties.id] }) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InternationalProspect = typeof internationalProspects.$inferSelect;
export type InternationalProspectContact = typeof internationalProspectContacts.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type PartnershipApplication = typeof partnershipApplications.$inferSelect;
export type LeadStatusHistory = typeof leadStatusHistory.$inferSelect;
