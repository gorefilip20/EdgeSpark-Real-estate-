import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import path from "node:path";
import { InsertUser, favorites, inquiries, internationalProspects, internationalProspectContacts, localAccounts, localUsers, partnershipApplications, properties, propertyMedia, users } from "../drizzle/schema";
import { getInternationalMarket, INTERNATIONAL_MARKET_CODES } from "@shared/internationalMarkets";
import { makeRequest, PlaceDetailsResult, PlacesSearchResult } from "./_core/map";
import { ENV } from "./_core/env";

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
    const candidates = [path.resolve(process.cwd(), "drizzle-pg/0000_supabase_initial.sql"), path.resolve(process.cwd(), "dist/drizzle-pg/0000_supabase_initial.sql")];
    const migrationPath = candidates.find(candidate => { try { readFileSync(candidate); return true; } catch { return false; } });
    if (!migrationPath) throw new Error("PostgreSQL migration file is missing from the deployment bundle");
    const migration = readFileSync(migrationPath, "utf8");
    const statements = migration.split(/--> statement-breakpoint/).map((statement: string) => statement.trim()).filter(Boolean);
    for (const statement of statements) {
      if (statement.startsWith("CREATE TYPE ")) {
        try { await db.execute(sql.raw(statement)); }
        catch (error) { const message = error instanceof Error ? error.message : String(error); if (!/already exists|duplicate object/i.test(message)) throw error; }
      } else {
        try { await db.execute(sql.raw(statement)); }
        catch (error) { console.warn("[Database] Optional PostgreSQL migration statement skipped:", error instanceof Error ? error.message : error); }
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
export async function listUsers() { const db = await getDb(); if (!db) return []; try { return await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, loginMethod: users.loginMethod, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.lastSignedIn)); } catch { return db.select({ id: localUsers.id, name: localUsers.name, email: localUsers.email, role: localUsers.role, loginMethod: localUsers.loginMethod, createdAt: localUsers.createdAt, lastSignedIn: localUsers.lastSignedIn }).from(localUsers).orderBy(desc(localUsers.lastSignedIn)); } }
export async function listLeads() { const db = await getDb(); if (!db) return { inquiries: [], partnerships: [] }; const [inquiryRows, partnershipRows] = await Promise.all([db.select().from(inquiries).orderBy(desc(inquiries.createdAt)), db.select().from(partnershipApplications).orderBy(desc(partnershipApplications.createdAt))]); return { inquiries: inquiryRows, partnerships: partnershipRows }; }

export async function searchInternationalBusinesses(query: string, countryCode: string, category = "real estate developer") {
  const market = getInternationalMarket(countryCode.toUpperCase());
  if (!market || !INTERNATIONAL_MARKET_CODES.has(market.code)) throw new Error("Choose a supported country from Europe, Asia, the Americas, or Africa.");
  const normalizedCategory = category.trim() || "real estate developer";
  // Text search is deliberately used without a fixed Places `type`. The fixed
  // real_estate_agency type silently excluded portfolio managers, investors,
  // agents, brokers, solar companies, and other partnership targets.
  const search = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", { query: `${normalizedCategory} ${query.trim()} in ${market.name}` });
  const candidates = (search.results || []).slice(0, 12);
  const enriched = await Promise.all(candidates.map(async place => {
    try {
      const detail = await makeRequest<PlaceDetailsResult>("/maps/api/place/details/json", { place_id: place.place_id, fields: "place_id,name,formatted_address,international_phone_number,website,url,rating,user_ratings_total,business_status,geometry,types" });
      const result = (detail.result || {}) as PlaceDetailsResult["result"] & { url?: string; business_status?: string; types?: string[] };
      return { placeId: place.place_id, name: result.name || place.name, address: result.formatted_address || place.formatted_address, phone: result.international_phone_number || result.formatted_phone_number, website: result.website, mapsUrl: result.url, rating: result.rating, userRatings: result.user_ratings_total, businessStatus: result.business_status, types: result.types || place.types, category: normalizedCategory, region: market.region, countryCode: market.code };
    } catch {
      return { placeId: place.place_id, name: place.name, address: place.formatted_address, phone: undefined, website: undefined, mapsUrl: undefined, rating: place.rating, userRatings: place.user_ratings_total, businessStatus: place.business_status, types: place.types, category: normalizedCategory, region: market.region, countryCode: market.code };
    }
  }));
  return enriched;
}

function uniqueMatches(values: string[]) { return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))); }
function safePublicUrl(value: string) { try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) return null; const host = url.hostname.toLowerCase(); if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local') || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return null; return url; } catch { return null; } }
export async function enrichPublicWebsite(website: string) {
  const source = safePublicUrl(website);
  if (!source) throw new Error("Only a public HTTPS website can be enriched.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(source, { signal: controller.signal, headers: { "User-Agent": "EdgePark-Estate-Partnership-Research/1.0" } });
    if (!response.ok) throw new Error("The public website could not be reached.");
    const html = (await response.text()).slice(0, 900_000);
    const emails = uniqueMatches(Array.from(html.matchAll(/mailto:([^\"'?#>\s]+)/gi), match => decodeURIComponent(match[1]).replace(/\?.*$/, "")).filter(email => /@/.test(email)));
    const phones = uniqueMatches(Array.from(html.matchAll(/tel:([^\"'?#>\s]+)/gi), match => decodeURIComponent(match[1])));
    const bookingUrls = uniqueMatches(Array.from(html.matchAll(/https?:\/\/[^\"'<>\s]+/gi), match => match[0]).filter(url => /(calendly|cal\.com|hubspot.*meeting|booking|schedule|appointment)/i.test(url)));
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const contactRole = /(partnership|business development|strategic alliance)/i.test(text) ? "Partnerships / Business Development" : /(investor relations|investor)/i.test(text) ? "Investor Relations" : "Business Development / Partnerships team";
    const contactPage = Array.from(html.matchAll(/href=[\"']([^\"']+)[\"']/gi), match => match[1]).map(href => { try { return new URL(href, source).toString(); } catch { return ""; } }).find(url => /(contact|about|team|leadership|partnership)/i.test(url));
    return { contactName: null, contactRole, email: emails[0] || null, phone: phones[0] || null, website: source.toString(), bookingUrl: bookingUrls[0] || null, sourceUrl: contactPage || source.toString(), publicSummary: text.slice(0, 4500), additionalEmails: emails.slice(1, 4), additionalPhones: phones.slice(1, 4) };
  } finally { clearTimeout(timeout); }
}
export async function listInternationalProspects() { const db = await getDb(); if (!db) return []; return db.select({ prospect: internationalProspects, contact: internationalProspectContacts }).from(internationalProspects).leftJoin(internationalProspectContacts, eq(internationalProspects.id, internationalProspectContacts.prospectId)).orderBy(desc(internationalProspects.updatedAt)).then(rows => rows.map(({ prospect, contact }) => ({ ...prospect, contact }))); }
export async function saveInternationalProspect(input: { placeId: string; region: string; countryCode: string; notes?: string; pitchAngle?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(internationalProspects).values(input).onConflictDoUpdate({ target: internationalProspects.placeId, set: { notes: input.notes, pitchAngle: input.pitchAngle } }); return db.select().from(internationalProspects).where(eq(internationalProspects.placeId, input.placeId)).limit(1).then(rows => rows[0]); }
export async function saveInternationalProspectContact(input: { prospectId: number; contactName?: string; contactRole?: string; email?: string; phone?: string; website?: string; bookingUrl?: string; sourceUrl?: string; meetingAt?: Date; meetingNotes?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { prospectId: _prospectId, ...contactUpdate } = input; await db.insert(internationalProspectContacts).values(input).onConflictDoUpdate({ target: internationalProspectContacts.prospectId, set: contactUpdate }); return { success: true }; }
export async function updateInternationalProspect(input: { id: number; status?: "new" | "researching" | "contacted" | "meeting" | "won" | "archived"; notes?: string; pitchAngle?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { id, ...changes } = input; await db.update(internationalProspects).set(changes).where(eq(internationalProspects.id, id)); return { success: true }; }
export async function updateInternationalProspectContact(input: { prospectId: number; contactName?: string; contactRole?: string; email?: string; phone?: string; website?: string; bookingUrl?: string; meetingAt?: Date; meetingNotes?: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const { prospectId: _prospectId, ...contactUpdate } = input; await db.insert(internationalProspectContacts).values(input).onConflictDoUpdate({ target: internationalProspectContacts.prospectId, set: contactUpdate }); return { success: true }; }
export { favorites, inquiries, internationalProspects, internationalProspectContacts, localAccounts, localUsers, partnershipApplications, properties, propertyMedia, users };
