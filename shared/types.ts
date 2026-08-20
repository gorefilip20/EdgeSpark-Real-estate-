/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type PropertyFilterDraft = {
  search: string;
  location: string;
  type: string;
  status: string;
  maxPrice: number;
};

export function buildPropertySearchInput(filters: Pick<PropertyFilterDraft, "search" | "location" | "type" | "status">) {
  return {
    search: `${filters.search} ${filters.location}`.trim(),
    type: filters.type,
    status: filters.status,
  };
}

export function buildPartnershipLeadPayload<T extends Record<string, string>, R extends string>(form: T, role: R): T & { role: R } {
  return { ...form, role };
}
