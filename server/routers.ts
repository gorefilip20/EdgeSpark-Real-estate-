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
  getPropertyBySlug,
  listAdminProperties,
  listFavoritesForUser,
  listLeads,
  listPublishedProperties,
  listUsers,
  listInternationalProspects,
  saveInternationalProspect,
  searchInternationalBusinesses,
  updateInternationalProspect,
  removeFavorite,
  saveFavorite,
  updateFavoriteMetadata,
  inquiries,
  partnershipApplications,
  properties,
  propertyMedia,
  localAccounts,
  users,
} from "./db";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

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
      const email = input.email.trim().toLowerCase();
      const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      const salt = randomBytes(16).toString("hex");
      const hash = scryptSync(input.password, salt, 32).toString("hex");
      const openId = `local_${randomBytes(18).toString("hex")}`;
      const role = ENV.ownerEmail && email === ENV.ownerEmail.toLowerCase() ? "admin" : "user";
      await db.insert(users).values({ openId, name: input.name.trim(), email, loginMethod: "email", role, lastSignedIn: new Date() });
      const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Account could not be created" });
      await db.insert(localAccounts).values({ userId: user.id, passwordHash: `${salt}:${hash}` });
      const token = await sdk.createSessionToken(openId, { name: input.name.trim() });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return user;
    }),
    login: publicProcedure.input(z.object({ email: z.string().email().max(320), password: z.string().min(1).max(200) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const email = input.email.trim().toLowerCase();
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
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
      return { ...user, role };
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
    search: adminOnly.input(z.object({ query: z.string().min(2).max(120), countryCode: z.string().length(2) })).query(async ({ input }) => {
      try {
        return await searchInternationalBusinesses(input.query.trim(), input.countryCode.toUpperCase());
      } catch (error) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "International business search is unavailable" });
      }
    }),
    saved: adminOnly.query(() => listInternationalProspects()),
    save: adminOnly.input(z.object({ placeId: z.string().min(3).max(180), region: z.string().min(2).max(32), countryCode: z.string().length(2), notes: z.string().max(4000).optional(), pitchAngle: z.string().max(4000).optional() })).mutation(({ input }) => saveInternationalProspect({ ...input, countryCode: input.countryCode.toUpperCase() })),
    update: adminOnly.input(z.object({ id: z.number().int(), status: z.enum(["new", "researching", "contacted", "meeting", "won", "archived"]).optional(), notes: z.string().max(4000).optional(), pitchAngle: z.string().max(4000).optional() })).mutation(({ input }) => updateInternationalProspect(input)),
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
        .$returningId();
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
