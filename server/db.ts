import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { InsertUser, favorites, inquiries, internationalProspects, localAccounts, partnershipApplications, properties, propertyMedia, users } from "../drizzle/schema";
import { getInternationalMarket, INTERNATIONAL_MARKET_CODES } from "@shared/internationalMarkets";
import { makeRequest, PlaceDetailsResult, PlacesSearchResult } from "./_core/map";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _localAuthSchemaReady = false;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  if (_db && !_localAuthSchemaReady) {
    try {
      await _db.execute(sql.raw("CREATE TABLE IF NOT EXISTS localAccounts (id INT AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL UNIQUE, passwordHash VARCHAR(255) NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"));
      await _db.execute(sql.raw("CREATE TABLE IF NOT EXISTS internationalProspects (id INT AUTO_INCREMENT PRIMARY KEY, placeId VARCHAR(180) NOT NULL UNIQUE, region VARCHAR(32) NOT NULL, countryCode VARCHAR(2) NOT NULL, status ENUM('new','researching','contacted','meeting','won','archived') NOT NULL DEFAULT 'new', notes TEXT NULL, pitchAngle TEXT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"));
    } catch (error) {
      console.warn("[Database] Local account table setup failed:", error);
    }
    _localAuthSchemaReady = true;
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
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }
async function withMedia(rows: any[]) { const db = await getDb(); if (!db || !rows.length) return rows.map((row) => ({ ...row, media: [] })); const ids = rows.map((row) => row.id); const media = await db.select().from(propertyMedia); return rows.map((row) => ({ ...row, media: media.filter((item) => ids.includes(item.propertyId)) })); }
export async function listPublishedProperties(filters?: { search?: string; type?: string; status?: string }) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(properties.published, 1)];
  if (filters?.type && filters.type !== "all") conditions.push(eq(properties.propertyType, filters.type as any));
  if (filters?.status && filters.status !== "all") conditions.push(eq(properties.status, filters.status as any));
  if (filters?.search) conditions.push(or(like(properties.title, `%${filters.search}%`), like(properties.address, `%${filters.search}%`), like(properties.neighborhood, `%${filters.search}%`), like(properties.city, `%${filters.search}%`), like(properties.state, `%${filters.search}%`), like(properties.propertyType, `%${filters.search}%`)) as any);
  return withMedia(await db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.featured), desc(properties.createdAt)));
}
export async function getPropertyBySlug(slug: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1); const result = await withMedia(rows); return result[0]; }
export async function listAdminProperties() { const db = await getDb(); if (!db) return []; return withMedia(await db.select().from(properties).orderBy(desc(properties.createdAt))); }
export async function listFavoritesForUser(userId: number) { const db = await getDb(); if (!db) return []; const rows = await db.select({ favorite: favorites, property: properties }).from(favorites).innerJoin(properties, eq(favorites.propertyId, properties.id)).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt)); return rows.map(({ favorite, property }) => { const metadata = favorite as typeof favorites.$inferSelect & { notes?: string | null; tags?: string | null }; return { ...property, favoriteId: favorite.id, notes: metadata.notes, tags: metadata.tags }; }); }
export async function saveFavorite(userId: number, propertyId: number) { const db = await getDb(); if (!db) return; const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))).limit(1); if (!existing.length) await db.insert(favorites).values({ userId, propertyId }); }
export async function removeFavorite(userId: number, propertyId: number) { const db = await getDb(); if (!db) return; await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))); }
export async function updateFavoriteMetadata(userId: number, propertyId: number, notes: string | null, tags: string | null) { const db = await getDb(); if (!db) return; await db.update(favorites).set({ notes, tags } as any).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId))); }
export async function listUsers() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)); }
export async function listLeads() { const db = await getDb(); if (!db) return { inquiries: [], partnerships: [] }; const [inquiryRows, partnershipRows] = await Promise.all([db.select().from(inquiries).orderBy(desc(inquiries.createdAt)), db.select().from(partnershipApplications).orderBy(desc(partnershipApplications.createdAt))]); return { inquiries: inquiryRows, partnerships: partnershipRows }; }

export async function searchInternationalBusinesses(query: string, countryCode: string) {
  const market = getInternationalMarket(countryCode);
  if (!market || !INTERNATIONAL_MARKET_CODES.has(countryCode)) throw new Error("International search is limited to Europe, Asia, and the Americas.");
  const search = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", { query: `${query} in ${market.name}`, type: "real_estate_agency" });
  const candidates = (search.results || []).slice(0, 8);
  const enriched = await Promise.all(candidates.map(async place => {
    try {
      const detail = await makeRequest<PlaceDetailsResult>("/maps/api/place/details/json", { place_id: place.place_id, fields: "place_id,name,formatted_address,international_phone_number,website,url,rating,user_ratings_total,business_status,geometry,types" });
      const result = (detail.result || {}) as PlaceDetailsResult["result"] & { url?: string; business_status?: string; types?: string[] };
      return { placeId: place.place_id, name: result.name || place.name, address: result.formatted_address || place.formatted_address, phone: result.international_phone_number, website: result.website, mapsUrl: result.url, rating: result.rating, userRatings: result.user_ratings_total, businessStatus: result.business_status, types: result.types || place.types, region: market.region, countryCode: market.code };
    } catch {
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: undefined, website: undefined, mapsUrl: undefined, rating: place.rating, userRatings: place.user_ratings_total, businessStatus: place.business_status, types: place.types, region: market.region, countryCode: market.code };
    }
  }));
  return enriched;
}

export async function listInternationalProspects() { const db = await getDb(); if (!db) return []; return db.select().from(internationalProspects).orderBy(desc(internationalProspects.updatedAt)); }
export async function saveInternationalProspect(input: { placeId: string; region: string; countryCode: string; notes?: string; pitchAngle?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(internationalProspects).values(input).onDuplicateKeyUpdate({ set: { notes: input.notes, pitchAngle: input.pitchAngle } }); return db.select().from(internationalProspects).where(eq(internationalProspects.placeId, input.placeId)).limit(1).then(rows => rows[0]); }
export async function updateInternationalProspect(input: { id: number; status?: "new" | "researching" | "contacted" | "meeting" | "won" | "archived"; notes?: string; pitchAngle?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { id, ...changes } = input; await db.update(internationalProspects).set(changes).where(eq(internationalProspects.id, id)); return { success: true }; }
export { favorites, inquiries, internationalProspects, localAccounts, partnershipApplications, properties, propertyMedia, users };
