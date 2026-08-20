/**
 * EdgeSpark — Drizzle Relations
 */

import { relations } from "drizzle-orm";
import { users, properties, deals, investorInterests, contacts, siteContent } from "./db_schema";

export const usersRelations = relations(users, ({ many }) => ({
  interests: many(investorInterests),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  property: one(properties, {
    fields: [deals.propertyId],
    references: [properties.id],
  }),
  interests: many(investorInterests),
}));

export const investorInterestsRelations = relations(investorInterests, ({ one }) => ({
  user: one(users, {
    fields: [investorInterests.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [investorInterests.dealId],
    references: [deals.id],
  }),
}));
