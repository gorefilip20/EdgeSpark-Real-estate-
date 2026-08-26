import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { notifyOwner } from "./_core/notification";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getDb,
  ensureAuthTables,
  getAuthSchemaDiagnostic,
  getPropertyBySlug,
  listAdminProperties,
  listFavoritesForUser,
  listLeads,
  listPublishedProperties,
  listUsers,
  enrichPublicWebsite,
  listInternationalProspects,
  saveInternationalProspect,
  saveInternationalProspectContact,
  searchInternationalBusinesses,
  updateInternationalProspect,
  updateInternationalProspectContact,
  removeFavorite,
  saveFavorite,
  updateFavoriteMetadata,
  inquiries,
  partnershipApplications,
  properties,
  propertyMedia,
  localAccounts,
  localUsers,
  users,
} from "./db";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { sendEdgeParkEmail } from "./email";

const propertyInput = z.object({
  title: z.string().min(4),
  slug: z
    .string()
    .min(4)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  status: z.enum(["draft", "available", "under_offer", "sold", "off_market"]),
  propertyType: z.enum([
    "apartment",
    "duplex",
    "bungalow",
    "land",
    "commercial",
    "other",
  ]),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default("Nigeria"),
  neighborhood: z.string().optional(),
  agentName: z.string().optional(),
  agentWhatsapp: z.string().optional(),
  developerName: z.string().optional(),
  developerWhatsapp: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  areaSqm: z.number().int().positive().optional(),
  projectedRoi: z.number().optional(),
  projectedYield: z.number().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});
const adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().min(2).max(120), email: z.string().email().max(320), password: z.string().min(8).max(200) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      try { await ensureAuthTables(db); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: getAuthSchemaDiagnostic() }); }
      const email = input.email.trim().toLowerCase();
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      const salt = randomBytes(16).toString("hex");
      const hash = scryptSync(input.password, salt, 32).toString("hex");
      const openId = `local_${randomBytes(18).toString("hex")}`;
      const role = ENV.ownerEmail && email === ENV.ownerEmail.toLowerCase() ? "admin" : "user";
      await db.insert(users).values({ openId, name: input.name.trim(), email, loginMethod: "email", role, lastSignedIn: new Date() });
      const [user] = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, loginMethod: users.loginMethod, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.openId, openId)).limit(1);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account could not be created" });
      await db.insert(localAccounts).values({ userId: user.id, passwordHash: `${salt}:${hash}` });
      const token = await sdk.createSessionToken(openId, { name: input.name.trim() });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return { ...user, sessionToken: token };
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(200) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      try { await ensureAuthTables(db); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: getAuthSchemaDiagnostic() }); }
      const email = input.email.trim().toLowerCase();
      const [user] = await db.select({ id: users.id, openId: users.openId, name: users.name, email: users.email, loginMethod: users.loginMethod, role: users.role, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.email, email)).limit(1);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      const [credential] = await db.select().from(localAccounts).where(eq(localAccounts.userId, user.id)).limit(1);
      if (!credential?.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      const [salt, expected] = credential.passwordHash.split(":");
      const actual = scryptSync(input.password, salt, 32);
      if (!expected || !timingSafeEqual(actual, Buffer.from(expected, "hex"))) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect" });
      const role = ENV.ownerEmail && email === ENV.ownerEmail.toLowerCase() ? "admin" : user.role;
      await db.update(users).set({ lastSignedIn: new Date(), role }).where(eq(users.id, user.id));
      const token = await sdk.createSessionToken(user.openId, { name: user.name || email });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return { ...user, role, sessionToken: token };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  favorites: router({
    list: protectedProcedure.query(({ ctx }) =>
      listFavoritesForUser(ctx.user.id)
    ),
    save: protectedProcedure
      .input(z.object({ propertyId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await saveFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ propertyId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.propertyId);
        return { success: true };
      }),
    updateMetadata: protectedProcedure
      .input(
        z.object({
          propertyId: z.number().int(),
          notes: z.string().max(2000).nullable(),
          tags: z.string().max(500).nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateFavoriteMetadata(
          ctx.user.id,
          input.propertyId,
          input.notes,
          input.tags
        );
        return { success: true };
      }),
  }),
  international: router({
    search: adminOnly.input(z.object({ query: z.string().min(2).max(120), countryCode: z.string().length(2), category: z.string().min(2).max(120).default("real estate developer") })).query(async ({ input }) => {
      try {
        return await searchInternationalBusinesses(input.query.trim(), input.countryCode.toUpperCase(), input.category.trim());
      } catch (error) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "International business search is unavailable" });
      }
    }),
    saved: adminOnly.query(() => listInternationalProspects()),
    enrichWebsite: adminOnly.input(z.object({ website: z.string().url().max(1000) })).mutation(({ input }) => enrichPublicWebsite(input.website)),
    generateDraft: adminOnly.input(z.object({ businessName: z.string().min(2).max(200), address: z.string().max(400).optional(), website: z.string().url().max(1000).optional(), phone: z.string().max(100).optional(), contactName: z.string().max(180).optional(), contactRole: z.string().max(180).optional(), websiteSummary: z.string().max(6000).optional(), sector: z.string().max(300).optional(), objective: z.enum(["strategic partnership", "bring customers", "list the business online", "real estate development", "property management", "solar and energy partnership", "other"]), offer: z.string().min(10).max(1200), tone: z.enum(["professional", "warm", "direct"]).default("professional") })).mutation(async ({ input }) => {
      const fallback = () => ({ subject: `Partnership conversation with ${input.businessName}`, greeting: `Hello ${input.contactName || `${input.businessName} partnerships team`},`, body: `EdgePark Estate is exploring a practical ${input.objective} collaboration with ${input.businessName}. Based on the public information supplied, we would like to understand your priorities and identify a focused way to create mutual value without making assumptions about your business.`, callToAction: "Would you be open to a 20-minute introductory conversation next week?", companySummary: `${input.businessName} is a public research lead in ${input.address || "the selected market"}. Verify its official website, current activities, and decision-maker before outreach.`, recommendedContact: input.contactRole || "Business Development / Partnerships team", whyThisFit: `The potential fit is a cross-market conversation around ${input.objective}, customer access, visibility, or complementary real-estate services. Validate demand and authority before proposing commercial terms.`, proposalAngle: input.offer, talkingPoints: [`Confirm the company’s current priorities and market focus.`, `Ask how it currently acquires customers or partners.`, `Present EdgePark’s Nigeria-based market access and partnership channel.`, `Agree on one small measurable pilot before discussing a larger deal.`], objectionsAndResponses: [{ objection: "Please send more details first.", response: "Share a one-page summary, the proposed pilot, expected responsibilities, and a clear next meeting request." }, { objection: "We already have partners.", response: "Position EdgePark as a complementary route into customers and opportunities rather than a replacement." }], nextStep: "Verify the official company website and identify the relevant partnerships or business-development contact before sending.", dealAnalysis: "Start with a low-risk pilot. Define the customer segment, deliverables, ownership, timeline, lead attribution, costs, and a review date. Only expand after both parties validate measurable outcomes.", revenuePaths: ["Referral or introduction fee agreed in writing", "Co-marketing or qualified-lead partnership", "Listing, visibility, or market-entry service", "Revenue share tied to verified completed transactions"], risksAndChecks: ["Verify the company identity and official contact channel.", "Do not rely on the research link as proof of capability.", "Confirm decision-making authority and conflict-of-interest constraints.", "Document lead ownership, payment triggers, privacy, and termination terms."], closePlan: ["Confirm the prospect’s goal and decision process.", "Offer one specific pilot with a short timeline.", "Agree on owners, deliverables, success metrics, and next meeting date.", "Send a written recap and simple terms for review.", "Run the pilot, measure results, resolve objections, and propose the next phase."], successMetrics: ["Qualified introductions generated", "Response and meeting rate", "Listings or customers converted", "Time to first measurable result", "Partner renewal or expansion decision"], factCheckNote: "This is a safe fallback brief generated from the supplied fields because the AI proxy did not return a usable response. Verify all company facts and contact details publicly before outreach." });
      try {
        const response = await invokeLLM({ messages: [
          { role: "system", content: "You write concise, credible B2B partnership outreach for EdgePark Estate in Nigeria. Use only the supplied facts about the recipient. Never invent a person, email address, booking link, clients, revenue, projects, awards, or capabilities. If a contact name is missing, address the relevant team or role. Make the proposal mutually beneficial, specific, respectful, and easy to reply to. Return JSON only." },
          { role: "user", content: JSON.stringify({ task: "Create an editable first-contact email plus fact-based company intelligence, partnership fit, a practical deal-analysis outline, revenue opportunities, risks, and a step-by-step deal-closing conversation plan", company: input.businessName, address: input.address, website: input.website, phone: input.phone, contactName: input.contactName, contactRole: input.contactRole, websiteSummary: input.websiteSummary, sector: input.sector, objective: input.objective, edgeParkOffer: input.offer, tone: input.tone }) },
        ], responseFormat: { type: "json_schema", json_schema: { name: "outreach_draft", strict: true, schema: { type: "object", properties: { subject: { type: "string" }, greeting: { type: "string" }, body: { type: "string" }, callToAction: { type: "string" }, companySummary: { type: "string" }, recommendedContact: { type: "string" }, whyThisFit: { type: "string" }, proposalAngle: { type: "string" }, talkingPoints: { type: "array", items: { type: "string" } }, objectionsAndResponses: { type: "array", items: { type: "object", properties: { objection: { type: "string" }, response: { type: "string" } }, required: ["objection", "response"], additionalProperties: false } }, nextStep: { type: "string" }, dealAnalysis: { type: "string" }, revenuePaths: { type: "array", items: { type: "string" } }, risksAndChecks: { type: "array", items: { type: "string" } }, closePlan: { type: "array", items: { type: "string" } }, successMetrics: { type: "array", items: { type: "string" } }, factCheckNote: { type: "string" } }, required: ["subject", "greeting", "body", "callToAction", "companySummary", "recommendedContact", "whyThisFit", "proposalAngle", "talkingPoints", "objectionsAndResponses", "nextStep", "dealAnalysis", "revenuePaths", "risksAndChecks", "closePlan", "successMetrics", "factCheckNote"], additionalProperties: false } } }, maxTokens: 2600 });
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") throw new Error("The AI draft service returned no usable content");
        try { return JSON.parse(content); } catch { throw new Error("The AI draft service returned an invalid draft"); }
      } catch (error) {
        console.warn("[International outreach] AI proxy unavailable; returning safe structured fallback:", error instanceof Error ? error.message : error);
        return fallback();
      }
    }),
    sendEmail: adminOnly.input(z.object({ to: z.string().email().max(320), companyName: z.string().min(2).max(200), subject: z.string().min(2).max(240), greeting: z.string().max(500), body: z.string().min(10).max(12000), callToAction: z.string().max(2000), proposalAngle: z.string().max(4000).optional() })).mutation(async ({ input }) => {
      try { return await sendEdgeParkEmail(input); } catch (error) { throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "Email could not be sent" }); }
    }),
    save: adminOnly.input(z.object({ placeId: z.string().min(3).max(180), region: z.string().min(2).max(32), countryCode: z.string().length(2), notes: z.string().max(4000).optional(), pitchAngle: z.string().max(4000).optional() })).mutation(({ input }) => saveInternationalProspect({ ...input, countryCode: input.countryCode.toUpperCase() })),
    update: adminOnly.input(z.object({ id: z.number().int(), status: z.enum(["new", "researching", "contacted", "meeting", "won", "archived"]).optional(), notes: z.string().max(4000).optional(), pitchAngle: z.string().max(4000).optional() })).mutation(({ input }) => updateInternationalProspect(input)),
    saveContact: adminOnly.input(z.object({ prospectId: z.number().int(), contactName: z.string().max(180).optional(), contactRole: z.string().max(180).optional(), email: z.string().email().max(320).optional(), phone: z.string().max(80).optional(), website: z.string().url().max(1000).optional(), bookingUrl: z.string().url().max(1000).optional(), sourceUrl: z.string().url().max(1000).optional(), meetingAt: z.coerce.date().optional(), meetingNotes: z.string().max(4000).optional() })).mutation(({ input }) => saveInternationalProspectContact(input)),
    updateContact: adminOnly.input(z.object({ prospectId: z.number().int(), contactName: z.string().max(180).optional(), contactRole: z.string().max(180).optional(), email: z.string().email().max(320).optional(), phone: z.string().max(80).optional(), website: z.string().url().max(1000).optional(), bookingUrl: z.string().url().max(1000).optional(), meetingAt: z.coerce.date().optional(), meetingNotes: z.string().max(4000).optional() })).mutation(({ input }) => updateInternationalProspectContact(input)),
  }),
  properties: router({
    list: publicProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            type: z.string().optional(),
            status: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => listPublishedProperties(input)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getPropertyBySlug(input.slug)),
    featured: publicProcedure.query(() =>
      listPublishedProperties({ status: "available" })
    ),
    adminList: adminOnly.query(() => listAdminProperties()),
    users: adminOnly.query(() => listUsers()),
    create: adminOnly.input(propertyInput).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      const [created] = await db
        .insert(properties)
        .values({
          ...input,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          projectedRoi: input.projectedRoi?.toString(),
          projectedYield: input.projectedYield?.toString(),
          featured: input.featured ? 1 : 0,
          published: input.published ? 1 : 0,
        })
        .returning({ id: properties.id });
      return created;
    }),
    update: adminOnly
      .input(propertyInput.extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { id, ...rest } = input;
        await db
          .update(properties)
          .set({
            ...rest,
            latitude: rest.latitude?.toString(),
            longitude: rest.longitude?.toString(),
            projectedRoi: rest.projectedRoi?.toString(),
            projectedYield: rest.projectedYield?.toString(),
            featured: rest.featured ? 1 : 0,
            published: rest.published ? 1 : 0,
          })
          .where((await import("drizzle-orm")).eq(properties.id, id));
        return { success: true };
      }),
    uploadMedia: adminOnly
      .input(
        z.object({
          propertyId: z.number().int(),
          fileName: z.string(),
          mimeType: z.string(),
          dataBase64: z.string(),
          isHero: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.length > 12 * 1024 * 1024)
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "Property images must be under 12MB",
          });
        const result = await storagePut(
          `properties/${input.propertyId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
          bytes,
          input.mimeType
        );
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .insert(propertyMedia)
          .values({
            propertyId: input.propertyId,
            url: result.url,
            storageKey: result.key,
            fileName: input.fileName,
            mimeType: input.mimeType,
            isHero: input.isHero ? 1 : 0,
          });
        return result;
      }),
    deleteMedia: adminOnly
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .delete(propertyMedia)
          .where((await import("drizzle-orm")).eq(propertyMedia.id, input.id));
        return { success: true };
      }),
    reorderMedia: adminOnly
      .input(
        z.object({
          propertyId: z.number().int(),
          orderedIds: z.array(z.number().int()).min(1),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await Promise.all(
          input.orderedIds.map((id, sortOrder) =>
            db
              .update(propertyMedia)
              .set({ sortOrder })
              .where(
                and(
                  eq(propertyMedia.id, id),
                  eq(propertyMedia.propertyId, input.propertyId)
                )
              )
          )
        );
        return { success: true };
      }),
    setHeroMedia: adminOnly
      .input(
        z.object({
          propertyId: z.number().int(),
          mediaId: z.number().int(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .update(propertyMedia)
          .set({ isHero: 0 })
          .where(eq(propertyMedia.propertyId, input.propertyId));
        await db
          .update(propertyMedia)
          .set({ isHero: 1 })
          .where(
            and(
              eq(propertyMedia.id, input.mediaId),
              eq(propertyMedia.propertyId, input.propertyId)
            )
          );
        return { success: true };
      }),
    updatePrice: adminOnly
      .input(z.object({ id: z.number().int(), price: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .update(properties)
          .set({ price: input.price })
          .where((await import("drizzle-orm")).eq(properties.id, input.id));
        return { success: true };
      }),
  }),
  leads: router({
    submitInquiry: publicProcedure
      .input(
        z.object({
          propertyId: z.number().optional(),
          propertyTitle: z.string().optional(),
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .insert(inquiries)
          .values({
            propertyId: input.propertyId,
            userId: ctx.user?.id,
            propertyTitle: input.propertyTitle ?? "Property inquiry",
            email: input.email,
            phone: input.phone,
            message: `${input.name}: ${input.message}`,
          });
        const ok = await notifyOwner({
          title: `New property inquiry from ${input.name}`,
          content: `${input.propertyTitle ?? "A property"}\n${input.email}\n${input.phone ?? "No phone provided"}\n\n${input.message}`,
        });
        if (!ok)
          console.error(
            "[LeadNotifications] Owner alert unavailable for inquiry",
            input.email
          );
        return { success: true, notified: ok, needsFollowUp: !ok };
      }),
    submitPartnership: publicProcedure
      .input(
        z.object({
          role: z.enum(["investor", "owner", "agent", "developer", "realtor"]),
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          company: z.string().optional(),
          investmentRange: z.string().optional(),
          message: z.string().min(10),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db
          .insert(partnershipApplications)
          .values({ ...input, userId: ctx.user?.id });
        const ok = await notifyOwner({
          title: `New ${input.role} partnership application`,
          content: `${input.name} · ${input.email}\n${input.company ?? ""}\n\n${input.message}`,
        });
        if (!ok)
          console.error(
            "[LeadNotifications] Owner alert unavailable for partnership",
            input.email
          );
        return { success: true, notified: ok, needsFollowUp: !ok };
      }),
    adminList: adminOnly.query(() => listLeads()),
    updateInquiry: adminOnly
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "qualified", "closed"]),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const current = await db
          .select()
          .from(inquiries)
          .where((await import("drizzle-orm")).eq(inquiries.id, input.id))
          .limit(1);
        await db
          .update(inquiries)
          .set({ status: input.status })
          .where((await import("drizzle-orm")).eq(inquiries.id, input.id));
        await db
          .insert((await import("../drizzle/schema")).leadStatusHistory)
          .values({
            leadType: "inquiry",
            leadId: input.id,
            fromStatus: current[0]?.status,
            toStatus: input.status,
            note: input.note,
          });
        return { success: true };
      }),
    updatePartnership: adminOnly
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "new",
            "reviewed",
            "contacted",
            "approved",
            "declined",
          ]),
          note: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const current = await db
          .select()
          .from(partnershipApplications)
          .where(
            (await import("drizzle-orm")).eq(
              partnershipApplications.id,
              input.id
            )
          )
          .limit(1);
        await db
          .update(partnershipApplications)
          .set({ status: input.status })
          .where(
            (await import("drizzle-orm")).eq(
              partnershipApplications.id,
              input.id
            )
          );
        await db
          .insert((await import("../drizzle/schema")).leadStatusHistory)
          .values({
            leadType: "partnership",
            leadId: input.id,
            fromStatus: current[0]?.status,
            toStatus: input.status,
            note: input.note,
          });
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
