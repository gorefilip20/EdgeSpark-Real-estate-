import { and, desc, eq, like, or, gte, isNotNull, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import path from "node:path";
import { InsertUser, favorites, inquiries, internationalProspects, internationalProspectContacts, localAccounts, localUsers, partnershipApplications, properties, propertyMedia, users, ownerProperties, ownerProfiles, ownerConsents, verificationAuditEvents } from "../drizzle/schema";
import { getInternationalMarket, INTERNATIONAL_MARKET_CODES } from "@shared/internationalMarkets";
import { makeRequest, PlaceDetailsResult, PlacesSearchResult } from "./_core/map";
import { ENV } from "./_core/env";
import { validateMarketCodes, validatePriceRange } from "./marketValidation";
import { fetchPublicHttps } from "./safeFetch";

let _db: ReturnType<typeof drizzle> | null = null;
let _localAuthSchemaReady = false;
let _lastAuthSchemaError = "";

let _fullSchemaReady = false;

async function ensureRequiredAuthSchema(db: any) {
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY NOT NULL, "openId" VARCHAR(64) NOT NULL UNIQUE, "name" TEXT, "email" VARCHAR(320), "loginMethod" VARCHAR(64), "passwordHash" TEXT, "role" VARCHAR(16) DEFAULT 'user' NOT NULL, "createdAt" TIMESTAMP DEFAULT now() NOT NULL, "updatedAt" TIMESTAMP DEFAULT now() NOT NULL, "lastSignedIn" TIMESTAMP DEFAULT now() NOT NULL)`));
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS "localAccounts" ("id" SERIAL PRIMARY KEY NOT NULL, "userId" INTEGER NOT NULL UNIQUE, "passwordHash" VARCHAR(255) NOT NULL, "createdAt" TIMESTAMP DEFAULT now() NOT NULL, "updatedAt" TIMESTAMP DEFAULT now() NOT NULL)`));
  _localAuthSchemaReady = true;
}

async function ensurePostgresSchema(db: any) {
  await ensureRequiredAuthSchema(db);
  if (_fullSchemaReady) return;
  try {
    const roots = [path.resolve(process.cwd()), path.resolve(process.cwd(), "dist")];
    const migrationPaths = ["drizzle-pg/0000_supabase_initial.sql", "drizzle-pg/0001_owner_verification_deals.sql", "drizzle-pg/0002_international_inventory_pipeline.sql"].map(file => roots.map(root => path.resolve(root, file)).find(candidate => { try { readFileSync(candidate); return true; } catch { return false; } })).filter(Boolean) as string[];
    if (migrationPaths.length !== 3) throw new Error("Complete PostgreSQL migration chain is missing from the deployment bundle");
    for (const migrationPath of migrationPaths) {
      const migration = readFileSync(migrationPath, "utf8");
      const statements = migration.split(/--> statement-breakpoint/).map((statement: string) => statement.trim()).filter(Boolean);
      for (const statement of statements) {
      if (statement.startsWith("CREATE TYPE ")) {
        try { await db.execute(sql.raw(statement)); }
        catch (error) { const message = error instanceof Error ? error.message : String(error); if (!/already exists|duplicate object/i.test(message)) throw error; }
        } else {
          try { await db.execute(sql.raw(statement)); }
          catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isBaseline = migrationPath.endsWith("0000_supabase_initial.sql");
            if (!isBaseline || !/already exists|duplicate object|duplicate key/i.test(message)) throw error;
          }
        }
      }
    }
  } catch (error) {
    console.error("[Database] Optional PostgreSQL schema migration incomplete; authentication remains available:", error instanceof Error ? error.message : error);
  }
  _fullSchemaReady = true;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 5, idleTimeoutMillis: 30000 })); }
    catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  if (_db && !_localAuthSchemaReady) {
    try { await ensurePostgresSchema(_db); }
    catch (error) { _localAuthSchemaReady = false; _lastAuthSchemaError = error instanceof Error ? error.message : String(error); console.error("[Database] PostgreSQL schema setup failed:", _lastAuthSchemaError); }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId || (ENV.ownerEmail && user.email === ENV.ownerEmail)) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date(); updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}
export function getAuthSchemaDiagnostic() {
  const raw = _lastAuthSchemaError.toLowerCase();
  if (/password authentication failed|authentication failed|password/.test(raw)) return "The Supabase database password was rejected.";
  if (/enotfound|could not translate|name or service not known|connect eai_again/.test(raw)) return "The Supabase database host could not be found.";
  if (/timeout|timed out|etimedout|econnrefused|connection terminated/.test(raw)) return "Hostinger could not connect to the Supabase database. Use the Supabase Session Pooler URL and confirm the pooler is reachable.";
  if (/self[- ]signed certificate|certificate verify failed|ssl/.test(raw)) return "The Supabase SSL connection failed. Use the Supabase PostgreSQL Session Pooler URI and confirm it includes the correct host and port.";
  if (/database .*does not exist|3d000/.test(raw)) return "The database named in DATABASE_URL does not exist. Copy the PostgreSQL URI from the correct Supabase project.";
  if (/permission denied|must be owner|not enough privileges|insufficient privilege/.test(raw)) return "The Supabase database user does not have permission to create or alter the required tables.";
  if (/migration file is missing/.test(raw)) return "The PostgreSQL migration file is missing from the deployed bundle.";
  const code = _lastAuthSchemaError.match(/\b[0-9A-Z]{5}\b/)?.[0];
  return `Supabase schema initialization failed${code ? ` (PostgreSQL code ${code})` : ""}. Open Hostinger Runtime logs and check the first PostgreSQL error.`;
}
export async function ensureAuthTables(db: any) {
  try { await ensurePostgresSchema(db); }
  catch (error) { _lastAuthSchemaError = error instanceof Error ? error.message : String(error); console.error("[Database] Required PostgreSQL schema is unavailable:", _lastAuthSchemaError); throw new Error("AUTH_SCHEMA_NOT_READY"); }
}

export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; try { await ensureAuthTables(db); } catch { return undefined; } try { const result = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, loginMethod: users.loginMethod, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.openId, openId)).limit(1); if (result[0]) { const ownerEmail = ENV.ownerEmail?.trim().toLowerCase(); return { ...result[0], role: ownerEmail && result[0].email?.trim().toLowerCase() === ownerEmail ? "admin" : result[0].role } as any; } } catch (error) { console.warn("[Database] Legacy users lookup failed; using localUsers:", error instanceof Error ? error.message : error); } try { const localResult = await db.select().from(localUsers).where(eq(localUsers.openId, openId)).limit(1); return localResult[0] as any; } catch (error) { console.warn("[Database] No localUsers fallback available:", error instanceof Error ? error.message : error); return undefined; } }
async function withMedia(rows: any[]) { const db = await getDb(); if (!db || !rows.length) return rows.map((row) => ({ ...row, media: [] })); const ids = rows.map((row) => row.id); const media = await db.select().from(propertyMedia); return rows.map((row) => ({ ...row, media: media.filter((item) => ids.includes(item.propertyId)) })); }
export type PublicProperty = {
  id: number; slug: string; title: string; description: string; status: string; propertyType: string; address: string; city: string; state: string; country: string; countryCode: string; currencyCode: string; neighborhood: string | null; price: number; bedrooms: number | null; bathrooms: number | null; areaSqm: number | null; featured: number; published: number; sourceLabel: string | null; sourceType: string; sellingConditions: string | null; buyerCosts: string | null; availabilityDate: Date | null; verificationStatus: string; reviewState: string; lastReviewedAt: Date | null; media: any[];
};
function toPublicProperty(row: any): PublicProperty { return { id: row.id, slug: row.slug, title: row.title, description: row.description, status: row.status, propertyType: row.propertyType, address: row.address, city: row.city, state: row.state, country: row.country, countryCode: row.countryCode, currencyCode: row.currencyCode, neighborhood: row.neighborhood, price: Number(row.price), bedrooms: row.bedrooms, bathrooms: row.bathrooms, areaSqm: row.areaSqm, featured: row.featured, published: row.published, sourceLabel: row.sourceLabel, sourceType: row.sourceType, sellingConditions: row.sellingConditions, buyerCosts: row.buyerCosts, availabilityDate: row.availabilityDate, verificationStatus: row.verificationStatus, reviewState: row.reviewState, lastReviewedAt: row.lastReviewedAt, media: row.media || [] }; }
export async function listPublishedProperties(filters?: { search?: string; type?: string; status?: string; countryCode?: string; currencyCode?: string; minPrice?: number; maxPrice?: number }) {
  const db = await getDb(); if (!db) return [];
  validatePriceRange(filters?.minPrice, filters?.maxPrice);
  const conditions: any[] = [eq(properties.published, 1), eq(properties.reviewState, "approved"), eq(properties.status, "available"), isNotNull(properties.approvedBy), isNotNull(properties.lastReviewedAt)];
  if (filters?.type && filters.type !== "all") conditions.push(eq(properties.propertyType, filters.type as any));
  if (filters?.status && filters.status !== "all") conditions.push(eq(properties.status, filters.status as any));
  if (filters?.countryCode && filters.countryCode !== "all") { const country = filters.countryCode.toUpperCase(); const currency = filters.currencyCode && filters.currencyCode !== "all" ? filters.currencyCode : undefined; if (currency) validateMarketCodes(country, currency); conditions.push(eq(properties.countryCode, country)); }
  if (filters?.currencyCode && filters.currencyCode !== "all") { const currency = filters.currencyCode.toUpperCase(); if (!filters.countryCode || filters.countryCode === "all") { if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Choose a supported ISO currency code."); } conditions.push(eq(properties.currencyCode, currency)); }
  if (typeof filters?.minPrice === "number") conditions.push(gte(properties.price, filters.minPrice));
  if (typeof filters?.maxPrice === "number") conditions.push(lte(properties.price, filters.maxPrice));
  if (filters?.search) conditions.push(or(like(properties.title, `%${filters.search}%`), like(properties.address, `%${filters.search}%`), like(properties.neighborhood, `%${filters.search}%`), like(properties.city, `%${filters.search}%`), like(properties.state, `%${filters.search}%`), like(properties.country, `%${filters.search}%`), like(properties.countryCode, `%${filters.search.toUpperCase()}%`), like(properties.propertyType, `%${filters.search}%`)) as any);
  return (await withMedia(await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.featured), desc(properties.createdAt)))).map(toPublicProperty);
}
export async function getPropertyBySlug(slug: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(properties).where(and(eq(properties.slug, slug), eq(properties.published, 1), eq(properties.reviewState, "approved"), eq(properties.status, "available"), isNotNull(properties.approvedBy), isNotNull(properties.lastReviewedAt))).limit(1); const result = await withMedia(rows); return result[0] ? toPublicProperty(result[0]) : undefined; }
export async function getAdminProperty(id: number) { const db = await getDb(); if (!db) return undefined; const [row] = await db.select().from(properties).where(eq(properties.id, id)).limit(1); return row; }
export async function createPropertyWithAudit(input: any, actorId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async (tx: any) => { const [created] = await tx.insert(properties).values(input).returning(); await tx.insert(verificationAuditEvents).values({ actorId, action: "property_created", entityType: "property", entityId: created.id, fromStatus: null, toStatus: created.reviewState, metadata: JSON.stringify({ published: created.published }) }); return created; }); }
export async function updatePropertyWithAudit(id: number, input: any, actorId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async (tx: any) => { const [current] = await tx.select().from(properties).where(eq(properties.id, id)).limit(1); if (!current) throw new Error("Property not found"); const [updated] = await tx.update(properties).set(input).where(eq(properties.id, id)).returning(); await tx.insert(verificationAuditEvents).values({ actorId, action: "property_updated", entityType: "property", entityId: id, fromStatus: current.reviewState, toStatus: updated.reviewState, metadata: JSON.stringify({ published: updated.published, previousPublished: current.published }) }); return updated; }); }
export async function reviewPropertyWithAudit(id: number, reviewState: "approved" | "rejected" | "stale", actorId: number, note?: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async (tx: any) => { const [current] = await tx.select().from(properties).where(eq(properties.id, id)).limit(1); if (!current) throw new Error("Property not found"); const [updated] = await tx.update(properties).set({ reviewState, published: reviewState === "approved" ? 1 : 0, approvedBy: reviewState === "approved" ? actorId : null, approvedAt: reviewState === "approved" ? new Date() : null, lastReviewedAt: new Date() }).where(eq(properties.id, id)).returning(); await tx.insert(verificationAuditEvents).values({ actorId, action: "property_reviewed", entityType: "property", entityId: id, fromStatus: current.reviewState, toStatus: reviewState, metadata: JSON.stringify({ note, previousPublished: current.published }) }); return updated; }); }
export async function listAdminProperties() { const db = await getDb(); if (!db) return []; return withMedia(await db.select().from(properties).orderBy(desc(properties.createdAt))); }
export async function listFavoritesForUser(userId: number) { const db = await getDb(); if (!db) return []; const rows = await db.select({ favorite: favorites, property: properties }).from(favorites).innerJoin(properties, eq(favorites.propertyId, properties.id)).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt)); return rows.map(({ favorite, property }) => { const metadata = favorite as typeof favorites.$inferSelect & { notes?: string | null; tags?: string | null }; return { ...property, favoriteId: favorite.id, notes: metadata.notes, tags: metadata.tags }; }); }
export async function saveFavorite(userId: number, propertyId: number) { const db = await getDb(); if (!db) return; const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))).limit(1); if (!existing.length) await db.insert(favorites).values({ userId, propertyId }); }
export async function removeFavorite(userId: number, propertyId: number) { const db = await getDb(); if (!db) return; await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))); }
export async function updateFavoriteMetadata(userId: number, propertyId: number, notes: string | null, tags: string | null) { const db = await getDb(); if (!db) return; await db.update(favorites).set({ notes, tags } as any).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))); }
export async function listUsers() { const db = await getDb(); if (!db) return []; try { return await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)); } catch { return db.select({ id: localUsers.id, name: localUsers.name, email: localUsers.email, role: localUsers.role, loginMethod: localUsers.loginMethod, createdAt: localUsers.createdAt, lastSignedIn: localUsers.lastSignedIn }).from(localUsers).orderBy(desc(localUsers.lastSignedIn)); } }
export async function listLeads() { const db = await getDb(); if (!db) return { inquiries: [], partnerships: [] }; const [inquiryRows, partnershipRows] = await Promise.all([db.select().from(inquiries).orderBy(desc(inquiries.createdAt)), db.select().from(partnershipApplications).orderBy(desc(partnershipApplications.createdAt))]); return { inquiries: inquiryRows, partnerships: partnershipRows }; }

export async function searchInternationalBusinesses(query: string, countryCode: string, category = "real estate developer") {
  const market = getInternationalMarket(countryCode.toUpperCase());
  if (!market || !INTERNATIONAL_MARKET_CODES.has(market.code)) throw new Error("Choose a supported country from Europe, Asia, the Americas, or Africa.");
  const normalizedCategory = category.trim() || "real estate developer";
  // Text search is deliberately used without a fixed Places `type`. The fixed
  // real_estate_agency type silently excluded portfolio managers, investors,
  // agents, brokers, solar companies, and other partnership targets.
  const requested = query.trim();
  const queryVariants = Array.from(new Set([
    `${normalizedCategory} ${requested} in ${market.name}`,
    `${requested} in ${market.name}`,
    `${normalizedCategory} in ${market.name}`,
    `businesses in ${market.name}`,
  ]));
  const allPlaces = new Map<string, PlacesSearchResult["results"][number]>();
  let lastStatus = "";
  try {
    for (const textQuery of queryVariants) {
      const search = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", { query: textQuery });
      lastStatus = search.status || lastStatus;
      for (const place of search.results || []) {
        if (place.place_id) allPlaces.set(place.place_id, place);
        if (allPlaces.size >= 12) break;
      }
      if (allPlaces.size >= 12) break;
    }
  } catch (error) {
    console.warn("[International search] Maps provider unavailable; using OpenStreetMap fallback:", error instanceof Error ? error.message : error);
  }
  let candidates = Array.from(allPlaces.values()).slice(0, 12);
  if (!candidates.length) {
    type OsmPlace = { place_id: number; display_name: string; lat: string; lon: string; type?: string; category?: string; osm_type?: string; extratags?: Record<string, string> };
    const osmQueries = Array.from(new Set([
      `${normalizedCategory}, ${market.name}`,
      `${requested}, ${market.name}`,
      `${normalizedCategory} in ${market.name}`,
      `real estate, ${market.name}`,
      `business, ${market.name}`,
    ]));
    const osmPlaces = new Map<string, OsmPlace>();
    for (const osmText of osmQueries) {
      const osmQuery = encodeURIComponent(osmText);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=12&q=${osmQuery}`, { headers: { "User-Agent": "EdgePark-Estate-Partnership-Research/1.0 (contact@edgesparkestate.site)", Accept: "application/json" } });
      if (!response.ok) continue;
      const found = await response.json() as OsmPlace[];
      for (const place of found) {
        const key = `${place.osm_type || "place"}-${place.place_id}`;
        if (!osmPlaces.has(key)) osmPlaces.set(key, place);
        if (osmPlaces.size >= 12) break;
      }
      if (osmPlaces.size >= 12) break;
    }
    candidates = Array.from(osmPlaces.values()).map(place => ({ place_id: `osm-${place.osm_type || "place"}-${place.place_id}`, name: place.display_name.split(",")[0] || place.display_name, formatted_address: place.display_name, geometry: { location: { lat: Number(place.lat), lng: Number(place.lon) } }, types: [place.type || place.category || normalizedCategory], phone: place.extratags?.phone || place.extratags?.contact_phone, website: place.extratags?.website || place.extratags?.contact_website, email: place.extratags?.email || place.extratags?.contact_email, contact_name: place.extratags?.contact_name, contact_role: place.extratags?.contact_role }));
  }
  if (!candidates.length) {
    type WikiSearch = { pageid: number; title: string };
    const wikiQueries = Array.from(new Set([`${normalizedCategory} ${market.name}`, `${requested} ${market.name}`, `${normalizedCategory} companies ${market.name}`]));
    const wikiPlaces = new Map<number, WikiSearch>();
    for (const wikiText of wikiQueries) {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(wikiText)}&srlimit=8&format=json&origin=*`;
      const response = await fetch(url, { headers: { "User-Agent": "EdgePark-Estate-Partnership-Research/1.0 (contact@edgesparkestate.site)", Accept: "application/json" } });
      if (!response.ok) continue;
      const payload = await response.json() as { query?: { search?: WikiSearch[] } };
      for (const item of payload.query?.search || []) {
        if (item.pageid && !wikiPlaces.has(item.pageid)) wikiPlaces.set(item.pageid, item);
        if (wikiPlaces.size >= 8) break;
      }
      if (wikiPlaces.size >= 8) break;
    }
    candidates = Array.from(wikiPlaces.values()).map(item => ({ place_id: `wiki-${item.pageid}`, name: item.title, formatted_address: market.name, geometry: { location: { lat: 0, lng: 0 } }, types: [normalizedCategory] }));
  }
  if (!candidates.length) {
    // Never present a blank result panel solely because a provider has sparse
    // coverage. Give the admin a country-specific research lead they can open
    // and refine, without inventing a company or contact.
    const researchId = `research-${market.code}-${normalizedCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    candidates = [{ place_id: researchId, name: `${normalizedCategory} opportunities in ${market.name}`, formatted_address: market.name, geometry: { location: { lat: 0, lng: 0 } }, types: [normalizedCategory] }];
  }
  const firstId = String(candidates[0].place_id);
  const candidatesSource = firstId.startsWith("osm-") ? "OpenStreetMap" : firstId.startsWith("wiki-") ? "Wikipedia public research" : firstId.startsWith("research-") ? "Public research directory" : "Google Maps";
  const enriched = await Promise.all(candidates.map(async place => {
    if (String(place.place_id).startsWith("wiki-")) {
      const title = encodeURIComponent(place.name);
      const researchQuery = encodeURIComponent(`${place.name} ${market.name}`);
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: undefined, website: `https://www.google.com/search?q=${researchQuery}`, mapsUrl: `https://en.wikipedia.org/w/index.php?search=${title}`, rating: undefined, userRatings: undefined, businessStatus: "Public research lead — verify company details", types: place.types, category: normalizedCategory, source: candidatesSource, region: market.region, countryCode: market.code };
    }
    if (String(place.place_id).startsWith("research-")) {
      const researchQuery = encodeURIComponent(`${normalizedCategory} ${market.name}`);
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: undefined, website: `https://www.google.com/search?q=${researchQuery}`, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${researchQuery}`, rating: undefined, userRatings: undefined, businessStatus: "Research lead — verify publicly", types: place.types, category: normalizedCategory, source: candidatesSource, region: market.region, countryCode: market.code };
    }
    if (String(place.place_id).startsWith("osm-")) {
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: (place as any).phone, email: (place as any).email, contactName: (place as any).contact_name || null, contactRole: (place as any).contact_role || "Business Development / Partnerships team", website: (place as any).website, mapsUrl: `https://www.openstreetmap.org/${String(place.place_id).replace(/^osm-/, "").replace(/-/, "/")}`, rating: undefined, userRatings: undefined, businessStatus: "Listed on OpenStreetMap — verify details", types: place.types, category: normalizedCategory, source: candidatesSource, region: market.region, countryCode: market.code };
    }
    try {
      const detail = await makeRequest<PlaceDetailsResult>("/maps/api/place/details/json", { place_id: place.place_id, fields: "place_id,name,formatted_address,international_phone_number,website,url,rating,user_ratings_total,business_status,geometry,types" });
      const result = (detail.result || {}) as PlaceDetailsResult["result"] & { url?: string; business_status?: string; types?: string[] };
      return { placeId: place.place_id, name: result.name || place.name, address: result.formatted_address || place.formatted_address, phone: result.international_phone_number || result.formatted_phone_number, website: result.website, mapsUrl: result.url, rating: result.rating, userRatings: result.user_ratings_total, businessStatus: result.business_status, types: result.types || place.types, category: normalizedCategory, source: candidatesSource, region: market.region, countryCode: market.code };
    } catch {
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: undefined, website: undefined, mapsUrl: undefined, rating: place.rating, userRatings: place.user_ratings_total, businessStatus: place.business_status, types: place.types, category: normalizedCategory, source: candidatesSource, region: market.region, countryCode: market.code };
    }
  }));
  const hydrated = await Promise.all(enriched.slice(0, 8).map(async (result: any) => {
    let profile: any = null;
    const officialWebsite = safePublicUrl(result.website || "");
    if (officialWebsite) {
      try { profile = await enrichPublicWebsite(officialWebsite.toString()); } catch { profile = null; }
    }
    if (!profile?.email && !profile?.phone) {
      try {
        profile = await discoverPublicContacts({ businessName: result.name, country: market.name, category: normalizedCategory });
      } catch { profile = profile || null; }
    }
    return {
      ...result,
      email: result.email || profile?.email || undefined,
      phone: result.phone || profile?.phone || undefined,
      contactName: result.contactName || profile?.contactName || null,
      contactRole: result.contactRole || profile?.contactRole || "Business Development / Partnerships team",
      bookingUrl: profile?.bookingUrl || undefined,
      contactPage: profile?.sourceUrl || undefined,
      additionalEmails: profile?.additionalEmails || [],
      additionalPhones: profile?.additionalPhones || [],
      contactStatus: profile?.email || profile?.phone || result.email || result.phone ? "Public contact found — verify before outreach" : "No public phone/email found — verify website",
      contactSource: profile?.sourceUrl || result.website || result.mapsUrl || null,
    };
  }));
  return [...hydrated, ...enriched.slice(8)].sort((a: any, b: any) => {
    const score = (item: any) => Number(Boolean(item.email)) * 4 + Number(Boolean(item.phone)) * 3 + Number(Boolean(item.website)) * 2 + Number(Boolean(item.contactPage));
    return score(b) - score(a);
  });
}

function uniqueMatches(values: string[]) { return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))); }
export function safePublicUrl(value: string) { try { return new URL(value); } catch { return null; } }
export async function enrichPublicWebsite(website: string) {
  const result = await fetchPublicHttps(website);
  const source = result.url;
  const html = result.body;
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  const emails = uniqueMatches([...Array.from(html.matchAll(/mailto:([^\"'?#>\s]+)/gi), match => decodeURIComponent(match[1]).replace(/\?.*$/, "")), ...Array.from(visibleText.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi), match => match[0])].filter(email => /@/.test(email)));
  const phones = uniqueMatches([...Array.from(html.matchAll(/tel:([^\"'?#>\s]+)/gi), match => decodeURIComponent(match[1])), ...Array.from(visibleText.matchAll(/(?:\+?\d[\d .()\-]{7,}\d)/g), match => match[0].trim())]);
  const bookingUrls = uniqueMatches(Array.from(html.matchAll(/https?:\/\/[^\"'<>\s]+/gi), match => match[0]).filter(url => /(calendly|cal\.com|hubspot.*meeting|booking|schedule|appointment)/i.test(url)));
  const contactRole = /(partnership|business development|strategic alliance)/i.test(visibleText) ? "Partnerships / Business Development" : /(investor relations|investor)/i.test(visibleText) ? "Investor Relations" : "Business Development / Partnerships team";
  const contactPage = Array.from(html.matchAll(/href=[\"']([^\"']+)[\"']/gi), match => { try { return new URL(match[1], source).toString(); } catch { return ""; } }).find(url => /(contact|about|team|leadership|partnership)/i.test(url));
  return { contactName: null, contactRole, email: emails[0] || null, phone: phones[0] || null, website: source.toString(), bookingUrl: bookingUrls[0] || null, sourceUrl: contactPage || source.toString(), publicSummary: visibleText.slice(0, 4500), additionalEmails: emails.slice(1, 4), additionalPhones: phones.slice(1, 4) };
}
export async function discoverPublicContacts(input: { businessName: string; country?: string; category?: string }) {
  const query = [input.businessName, input.category, input.country].filter(Boolean).join(" ").trim();
  if (!query) throw new Error("A business name is required to discover public contacts.");
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(searchUrl, { headers: { "User-Agent": "EdgePark-Estate-Partnership-Research/1.0", Accept: "text/html" } });
  if (!response.ok) throw new Error("The public contact search provider could not be reached.");
  const html = (await response.text()).slice(0, 500_000);
  const links = uniqueMatches(Array.from(html.matchAll(/uddg=([^&\"']+)/gi), match => { try { return decodeURIComponent(match[1]); } catch { return ""; } }).map(link => link.replace(/&amp;/g, "&"))).map(link => safePublicUrl(link)).filter((url): url is URL => Boolean(url)).filter(url => !/(duckduckgo|google|bing|yahoo|wikipedia|openstreetmap)\./i.test(url.hostname));
  const profiles = [];
  for (const url of links.slice(0, 5)) {
    try { profiles.push(await enrichPublicWebsite(url.toString())); } catch { /* Continue to the next public result. */ }
    if (profiles.some(profile => profile.email || profile.phone)) break;
  }
  const best = profiles.sort((a, b) => Number(Boolean(b.email)) + Number(Boolean(b.phone)) - Number(Boolean(a.email)) - Number(Boolean(a.phone)))[0];
  return best ? { ...best, searchedFor: query, sources: profiles.map(profile => profile.sourceUrl).filter(Boolean) } : { contactName: null, contactRole: "Business Development / Partnerships team", email: null, phone: null, website: null, bookingUrl: null, sourceUrl: null, publicSummary: null, additionalEmails: [], additionalPhones: [], searchedFor: query, sources: [] };
}
export async function listInternationalProspects() { const db = await getDb(); if (!db) return []; return db.select({ prospect: internationalProspects, contact: internationalProspectContacts }).from(internationalProspects).leftJoin(internationalProspectContacts, eq(internationalProspects.id, internationalProspectContacts.prospectId)).orderBy(desc(internationalProspects.updatedAt)).then(rows => rows.map(({ prospect, contact }) => ({ ...prospect, contact }))); }
export async function saveInternationalProspect(input: { placeId: string; region: string; countryCode: string; category?: string; website?: string; sourceType?: string; sourceUrl?: string; notes?: string; pitchAngle?: string }, actorId?: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await db.select().from(internationalProspects).where(eq(internationalProspects.placeId, input.placeId)).limit(1); const row = existing[0]; const changes: any = { ...input, updatedAt: new Date() }; if (row) { if (actorId) await db.insert(verificationAuditEvents).values({ actorId, action: "prospect_updated", entityType: "international_prospect", entityId: row.id, fromStatus: row.doNotContact ? "suppressed" : "active", toStatus: row.doNotContact ? "suppressed" : "active", metadata: JSON.stringify({ suppressionChanged: false }) }); await db.update(internationalProspects).set(changes).where(eq(internationalProspects.id, row.id)); return { ...row, ...changes }; } const [created] = await db.insert(internationalProspects).values({ ...input, doNotContact: 0 }).returning(); return created; }
export async function saveInternationalProspectContact(input: { prospectId: number; contactName?: string; contactRole?: string; email?: string; phone?: string; website?: string; bookingUrl?: string; sourceUrl?: string; sourceType?: string; confidence?: string; meetingAt?: Date; meetingNotes?: string }, actorId?: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await db.select().from(internationalProspectContacts).where(eq(internationalProspectContacts.prospectId, input.prospectId)).limit(1); if (existing[0]) { await db.update(internationalProspectContacts).set({ ...input, updatedAt: new Date() }).where(eq(internationalProspectContacts.id, existing[0].id)); return { ...existing[0], ...input }; } const [created] = await db.insert(internationalProspectContacts).values({ ...input, doNotContact: 0 }).returning(); return created; }
export async function getInternationalSuppressionByEmail(email: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [contact] = await db.select({ prospectId: internationalProspectContacts.prospectId, contactSuppressed: internationalProspectContacts.doNotContact, prospectSuppressed: internationalProspects.doNotContact }).from(internationalProspectContacts).innerJoin(internationalProspects, eq(internationalProspects.id, internationalProspectContacts.prospectId)).where(eq(internationalProspectContacts.email, email.trim().toLowerCase())).limit(1); return contact ? Boolean(contact.contactSuppressed || contact.prospectSuppressed) : false; }
export async function setInternationalSuppression(input: { prospectId: number; doNotContact: boolean; reason: string; actorId: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.transaction(async (tx: any) => { const [current] = await tx.select().from(internationalProspects).where(eq(internationalProspects.id, input.prospectId)).limit(1); if (!current) throw new Error("Prospect not found"); await tx.update(internationalProspects).set({ doNotContact: input.doNotContact ? 1 : 0, updatedAt: new Date() }).where(eq(internationalProspects.id, input.prospectId)); await tx.insert(verificationAuditEvents).values({ actorId: input.actorId, action: "prospect_suppression_changed", entityType: "international_prospect", entityId: input.prospectId, fromStatus: current.doNotContact ? "suppressed" : "active", toStatus: input.doNotContact ? "suppressed" : "active", metadata: JSON.stringify({ reason: input.reason }) }); return { success: true }; }); }
export async function updateInternationalProspect(input: { id: number; status?: "new" | "researching" | "contacted" | "meeting" | "won" | "archived"; notes?: string; pitchAngle?: string; nextStep?: string; nextStepAt?: Date }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { id, ...changes } = input; await db.update(internationalProspects).set({ ...changes, updatedAt: new Date() }).where(eq(internationalProspects.id, id)); return { success: true }; }
export async function updateInternationalProspectContact(input: { prospectId: number; contactName?: string; contactRole?: string; email?: string; phone?: string; website?: string; bookingUrl?: string; meetingAt?: Date; meetingNotes?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { prospectId: _prospectId, ...contactUpdate } = input; await db.insert(internationalProspectContacts).values(input).onConflictDoUpdate({ target: internationalProspectContacts.prospectId, set: contactUpdate }); return { success: true }; }
export { favorites, inquiries, internationalProspects, internationalProspectContacts, localAccounts, localUsers, partnershipApplications, properties, propertyMedia, users };
