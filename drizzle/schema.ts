import { integer, pgEnum, pgTable, text, timestamp, varchar, numeric, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const role_user_admin_enum = pgEnum("role_user_admin_enum", ["user", "admin"]);
export const status_new_researching_contacted_meeting_won_archived_enum = pgEnum("status_new_researching_contacted_meeting_won_archived_enum", ["new", "researching", "contacted", "meeting", "won", "archived"]);
export const status_draft_available_under_offer_sold_off_market_enum = pgEnum("status_draft_available_under_offer_sold_off_market_enum", ["draft", "available", "under_offer", "sold", "off_market"]);
export const propertyType_apartment_duplex_bungalow_land_commercial_other_enum = pgEnum("propertyType_apartment_duplex_bungalow_land_commercial_other_enum", ["apartment", "duplex", "bungalow", "land", "commercial", "other"]);
export const verificationStatus_unverified_under_review_verified_enum = pgEnum("verificationStatus_unverified_under_review_verified_enum", ["unverified", "under_review", "verified"]);
export const status_new_contacted_qualified_closed_enum = pgEnum("status_new_contacted_qualified_closed_enum", ["new", "contacted", "qualified", "closed"]);
export const leadType_inquiry_partnership_enum = pgEnum("leadType_inquiry_partnership_enum", ["inquiry", "partnership"]);
export const role_investor_owner_agent_developer_realtor_enum = pgEnum("role_investor_owner_agent_developer_realtor_enum", ["investor", "owner", "agent", "developer", "realtor"]);
export const status_new_reviewed_contacted_approved_declined_enum = pgEnum("status_new_reviewed_contacted_approved_declined_enum", ["new", "reviewed", "contacted", "approved", "declined"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  role: role_user_admin_enum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const localUsers = pgTable("localUsers", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(),
  role: role_user_admin_enum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const localAccounts = pgTable("localAccounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const internationalProspects = pgTable("internationalProspects", {
  id: serial("id").primaryKey(),
  placeId: varchar("placeId", { length: 180 }).notNull().unique(),
  region: varchar("region", { length: 32 }).notNull(),
  countryCode: varchar("countryCode", { length: 2 }).notNull(),
  status: status_new_researching_contacted_meeting_won_archived_enum("status").default("new").notNull(),
  notes: text("notes"),
  pitchAngle: text("pitchAngle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const internationalProspectContacts = pgTable("internationalProspectContacts", {
  id: serial("id").primaryKey(),
  prospectId: integer("prospectId").notNull().unique(),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description").notNull(),
  status: status_draft_available_under_offer_sold_off_market_enum("status").default("draft").notNull(),
  propertyType: propertyType_apartment_duplex_bungalow_land_commercial_other_enum("propertyType").default("other").notNull(),
  address: varchar("address", { length: 240 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  country: varchar("country", { length: 120 }).default("Nigeria").notNull(),
  neighborhood: varchar("neighborhood", { length: 160 }),
  agentName: varchar("agentName", { length: 160 }),
  agentWhatsapp: varchar("agentWhatsapp", { length: 40 }),
  developerName: varchar("developerName", { length: 180 }),
  developerWhatsapp: varchar("developerWhatsapp", { length: 40 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  areaSqm: integer("areaSqm"),
  projectedRoi: numeric("projectedRoi", { precision: 5, scale: 2 }),
  projectedYield: numeric("projectedYield", { precision: 5, scale: 2 }),
  featured: integer("featured").default(0).notNull(),
  published: integer("published").default(0).notNull(),
  isDemo: integer("isDemo").default(0).notNull(),
  sourceLabel: varchar("sourceLabel", { length: 180 }),
  verificationStatus: verificationStatus_unverified_under_review_verified_enum("verificationStatus").default("unverified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  propertyId: integer("propertyId").notNull(),
  notes: text("notes"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const propertyMedia = pgTable("propertyMedia", {
  id: serial("id").primaryKey(),
  propertyId: integer("propertyId").notNull(),
  url: text("url").notNull(),
  storageKey: text("storageKey").notNull(),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 120 }),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isHero: integer("isHero").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("propertyId"),
  userId: integer("userId"),
  propertyTitle: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  message: text("message").notNull(),
  status: status_new_contacted_qualified_closed_enum("status").default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const leadStatusHistory = pgTable("leadStatusHistory", {
  id: serial("id").primaryKey(),
  leadType: leadType_inquiry_partnership_enum("leadType").notNull(),
  leadId: integer("leadId").notNull(),
  fromStatus: varchar("fromStatus", { length: 40 }),
  toStatus: varchar("toStatus", { length: 40 }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const partnershipApplications = pgTable("partnershipApplications", {
  id: serial("id").primaryKey(),
  role: role_investor_owner_agent_developer_realtor_enum("role").notNull(),
  userId: integer("userId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  company: varchar("company", { length: 180 }),
  investmentRange: varchar("investmentRange", { length: 120 }),
  message: text("message").notNull(),
  status: status_new_reviewed_contacted_approved_declined_enum("status").default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const propertiesRelations = relations(properties, ({ many }) => ({ media: many(propertyMedia), inquiries: many(inquiries), favorites: many(favorites) }));
export const favoritesRelations = relations(favorites, ({ one }) => ({ property: one(properties, { fields: [favorites.propertyId], references: [properties.id] }), user: one(users, { fields: [favorites.userId], references: [users.id] }) }));
export const propertyMediaRelations = relations(propertyMedia, ({ one }) => ({ property: one(properties, { fields: [propertyMedia.propertyId], references: [properties.id] }) }));
export const inquiryRelations = relations(inquiries, ({ one }) => ({ property: one(properties, { fields: [inquiries.propertyId], references: [properties.id] }) }));

export type User = typeof users.$inferSelect;
export type LocalUser = typeof localUsers.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InternationalProspect = typeof internationalProspects.$inferSelect;
export type InternationalProspectContact = typeof internationalProspectContacts.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type PartnershipApplication = typeof partnershipApplications.$inferSelect;
export type LeadStatusHistory = typeof leadStatusHistory.$inferSelect;
