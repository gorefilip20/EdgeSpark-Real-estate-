import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  deals,
  dealActivities,
  ownerConsents,
  ownerProfiles,
  ownerProperties,
  verificationAuditEvents,
  verificationChecks,
} from "../drizzle/schema";
import { sendEdgeParkEmail } from "./email";

async function notifyOwnerVerificationStatus(input: { ownerProfileId: number; checkType: string; status: string; resultSummary?: string | null; reviewerNotes?: string | null }) {
  const db = await getDb();
  if (!db) return;
  const [owner] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.id, input.ownerProfileId)).limit(1);
  if (!owner?.email) return;
  const label = input.checkType.replaceAll("_", " ");
  const statusLabel = input.status.replaceAll("_", " ");
  try {
    await sendEdgeParkEmail({
      to: owner.email,
      companyName: owner.companyName || owner.displayName,
      subject: `EdgeSparkEstate verification update: ${statusLabel}`,
      greeting: `Hello ${owner.displayName},`,
      body: `Your ${label} verification record has been updated to “${statusLabel}”.${input.resultSummary ? `\n\nResult: ${input.resultSummary}` : ""}${input.reviewerNotes ? `\n\nReviewer note: ${input.reviewerNotes}` : ""}`,
      callToAction: "Sign in to your EdgeSparkEstate account or contact the review team if you need to provide more information.",
    });
  } catch (error) {
    // Email delivery must not roll back a successful verification decision.
    console.error("[VerificationNotifications] owner email failed", { ownerProfileId: input.ownerProfileId, error });
  }
}

export type OwnerOnboardingInput = {
  ownerType: "individual" | "company" | "agent" | "developer" | "representative";
  legalName: string;
  displayName: string;
  companyName?: string;
  cacNumber?: string;
  lasreraNumber?: string;
  state?: string;
  city?: string;
  email: string;
  phone?: string;
  publicEmailAllowed?: boolean;
  publicPhoneAllowed?: boolean;
  marketingOptIn?: boolean;
};

export async function createOwnerProfile(userId: number, input: OwnerOnboardingInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [profile] = await db.insert(ownerProfiles).values({
    userId, ...input,
    publicEmailAllowed: input.publicEmailAllowed ? 1 : 0,
    publicPhoneAllowed: input.publicPhoneAllowed ? 1 : 0,
    marketingOptIn: input.marketingOptIn ? 1 : 0,
    privacyNoticeVersion: "2026-09-21-v1",
    status: "submitted",
  }).returning();
  await db.insert(ownerConsents).values({
    ownerProfileId: profile.id,
    purpose: "listing_and_verification",
    fieldsAllowed: JSON.stringify({ displayName: true, email: Boolean(input.publicEmailAllowed), phone: Boolean(input.publicPhoneAllowed) }),
    lawfulBasis: "consent",
    privacyNoticeVersion: "2026-09-21-v1",
  });
  await db.insert(verificationAuditEvents).values({ actorId: userId, action: "owner_submitted", entityType: "owner", entityId: profile.id, toStatus: "submitted", metadata: JSON.stringify({ ownerType: input.ownerType }) });
  return profile;
}

export async function listOwnerProfiles() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(ownerProfiles).orderBy(desc(ownerProfiles.createdAt));
}

export async function getOwnerProfileForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId)).orderBy(desc(ownerProfiles.createdAt));
}

export async function linkOwnerProperty(input: { ownerProfileId: number; propertyId: number; relationshipType: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [link] = await db.insert(ownerProperties).values(input).returning();
  return link;
}

export async function listVerificationChecks(ownerProfileId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(verificationChecks).where(ownerProfileId ? eq(verificationChecks.ownerProfileId, ownerProfileId) : undefined).orderBy(desc(verificationChecks.createdAt));
}

export async function createVerificationCheck(input: { ownerProfileId: number; propertyId?: number; checkType: "contact_email" | "contact_phone" | "cac_business" | "lasrera_practitioner" | "property_authority" | "identity" | "manual_review"; provider: string; resultSummary?: string; providerReference?: string; status?: "pending" | "verified" | "failed" | "expired"; reviewerId?: number; reviewerNotes?: string; expiresAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [check] = await db.insert(verificationChecks).values({ ...input, status: input.status ?? "pending", checkedAt: input.status && input.status !== "pending" ? new Date() : undefined }).returning();
  await db.insert(verificationAuditEvents).values({ actorId: input.reviewerId, action: "verification_created", entityType: "verification", entityId: check.id, toStatus: check.status, metadata: JSON.stringify({ checkType: check.checkType, provider: check.provider }) });
  if (check.status !== "pending") void notifyOwnerVerificationStatus({ ownerProfileId: check.ownerProfileId, checkType: check.checkType, status: check.status, resultSummary: check.resultSummary, reviewerNotes: check.reviewerNotes });
  return check;
}

export async function updateVerificationCheck(input: { id: number; status: "pending" | "verified" | "failed" | "expired"; reviewerId: number; reviewerNotes?: string; resultSummary?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [current] = await db.select().from(verificationChecks).where(eq(verificationChecks.id, input.id)).limit(1);
  if (!current) throw new Error("Verification check not found");
  const [updated] = await db.update(verificationChecks).set({ status: input.status, reviewerId: input.reviewerId, reviewerNotes: input.reviewerNotes, resultSummary: input.resultSummary, checkedAt: input.status === "pending" ? current.checkedAt : new Date(), updatedAt: new Date() }).where(eq(verificationChecks.id, input.id)).returning();
  await db.insert(verificationAuditEvents).values({ actorId: input.reviewerId, action: "verification_status_changed", entityType: "verification", entityId: input.id, fromStatus: current.status, toStatus: input.status, metadata: JSON.stringify({ notes: input.reviewerNotes }) });
  if (current.status !== updated.status) void notifyOwnerVerificationStatus({ ownerProfileId: updated.ownerProfileId, checkType: updated.checkType, status: updated.status, resultSummary: updated.resultSummary, reviewerNotes: updated.reviewerNotes });
  return updated;
}

export async function createDealFromInquiry(input: { inquiryId: number; ownerProfileId?: number; propertyId?: number; assignedAdminId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [deal] = await db.insert(deals).values(input).returning();
  await db.insert(dealActivities).values({ dealId: deal.id, actorId: input.assignedAdminId, activityType: "created", note: "Deal created from property enquiry" });
  return deal;
}

export async function listDeals() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.select().from(deals).orderBy(desc(deals.updatedAt));
}

export async function updateDealStatus(input: { id: number; status: "new" | "qualified" | "owner_contacted" | "client_contacted" | "viewing_scheduled" | "offer" | "negotiation" | "won" | "lost" | "on_hold"; actorId: number; note?: string; nextActionAt?: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [current] = await db.select().from(deals).where(eq(deals.id, input.id)).limit(1);
  if (!current) throw new Error("Deal not found");
  const [updated] = await db.update(deals).set({ status: input.status, nextActionAt: input.nextActionAt, lastContactedAt: input.status.includes("contacted") ? new Date() : current.lastContactedAt, wonAt: input.status === "won" ? new Date() : current.wonAt, updatedAt: new Date() }).where(eq(deals.id, input.id)).returning();
  await db.insert(dealActivities).values({ dealId: input.id, actorId: input.actorId, activityType: "status_changed", note: input.note, nextActionAt: input.nextActionAt });
  return updated;
}
