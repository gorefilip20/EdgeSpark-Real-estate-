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
  minPrice: number;
  maxPrice: number;
  transactionType: "all" | "buy" | "rent";
};

export function buildPropertySearchInput(filters: Pick<PropertyFilterDraft, "search" | "location" | "type" | "status" | "minPrice" | "maxPrice" | "transactionType">) {
  return {
    search: `${filters.search} ${filters.location}`.trim(),
    type: filters.type,
    status: filters.status,
    transactionType: filters.transactionType === "all" ? undefined : filters.transactionType,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  };
}

export const DEVELOPER_WHATSAPP = "2348141997159";

export const NIGERIA_LOCATION_OPTIONS = [
  "Lagos · Eti-Osa · Lekki Phase 1",
  "Lagos · Ikeja · Allen Avenue",
  "Lagos · Ibeju-Lekki · Elerangbe",
  "Abuja · AMAC · Maitama",
  "Abuja · AMAC · Wuse 2",
  "Abuja · Gwagwalada · Gwagwalada Town",
  "Ebonyi · Abakaliki · Kpiri-Kpiri",
  "Rivers · Obio-Akpor · Rumuola",
  "Oyo · Ibadan North · Bodija",
  "Ogun · Ifo · Oke-Aro",
] as const;

export function buildDeveloperWhatsAppLink(title = "a property") {
  return `https://wa.me/${DEVELOPER_WHATSAPP}?text=${encodeURIComponent(`Hello EdgeSpark, I would like to ask about the availability of ${title}.`)}`;
}

export function buildPriceUpdateInput(id: number, price: number) {
  return { id, price: Math.trunc(price) };
}

export function selectGalleryImage<T>(media: T[], selectedIndex: number) {
  return media[Math.min(Math.max(selectedIndex, 0), Math.max(media.length - 1, 0))];
}

export function rotateMediaByDay<T>(media: T[], dayIndex: number) {
  if (media.length < 2) return media;
  const offset = ((dayIndex % media.length) + media.length) % media.length;
  return media.map((_, index) => media[(index + offset) % media.length]);
}

export function shouldUseClipboardFallback(whatsappWindowOpened: boolean) {
  return !whatsappWindowOpened;
}

export function buildPropertyShareLink(title: string, location: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`Check out ${title} in ${location} on EdgeSpark: ${url}`)}`;
}

export function buildPartnershipLeadPayload<T extends Record<string, string>, R extends string>(form: T, role: R): T & { role: R } {
  return { ...form, role };
}

export function matchesPropertySearch(property: Record<string, unknown>, query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = [property.title, property.address, property.neighborhood, property.city, property.state, property.propertyType]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function matchesPropertyFilters(property: Record<string, unknown>, filters: Pick<PropertyFilterDraft, "search" | "location" | "type" | "status" | "minPrice" | "maxPrice" | "transactionType">) {
  return matchesPropertySearch(property, filters.search) && matchesPropertySearch(property, filters.location)
    && (!filters.minPrice || Number(property.price) >= filters.minPrice)
    && (!filters.maxPrice || Number(property.price) <= filters.maxPrice)
    && (filters.type === "all" || property.propertyType === filters.type)
    && (filters.transactionType === "all" || property.transactionType === filters.transactionType)
    && (filters.status === "all" || property.status === filters.status);
}

export type GallerySetStatus = "draft" | "approved" | "rejected";

export function buildGallerySetStatusInput(id: number, status: GallerySetStatus) {
  return { id, status } as const;
}

export function buildMediaReorderInput(propertyId: number, orderedIds: number[]) {
  return { propertyId, orderedIds: [...orderedIds] } as const;
}

export function shouldExposeGalleryToPublic(propertyPublished: boolean | number, galleryStatus: GallerySetStatus | null) {
  return Boolean(propertyPublished) && (galleryStatus === null || galleryStatus === "approved");
}

export function reorderMediaIds(orderedIds: number[], draggedId: number, targetId: number) {
  const next = [...orderedIds];
  const from = next.indexOf(draggedId);
  const to = next.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return next;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export type PropertyLocationExactness = "exact" | "approximate" | "unavailable";

export function getPropertyLocationExactness(property: { latitude?: unknown; longitude?: unknown; address?: string | null; city?: string | null; state?: string | null }): PropertyLocationExactness {
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) return "exact";
  if (property.address || property.city || property.state) return "approximate";
  return "unavailable";
}

export function buildGoogleMapsDirectionsUrl(property: { latitude?: unknown; longitude?: unknown; address?: string | null; city?: string | null; state?: string | null; country?: string | null }): string | null {
  const exactness = getPropertyLocationExactness(property);
  if (exactness === "exact") return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${Number(property.latitude)},${Number(property.longitude)}`)}`;
  const locationParts = [property.address, property.city, property.state].filter(Boolean);
  if (!locationParts.length) return null;
  const query = [...locationParts, property.country || "Nigeria"].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getPropertyMapCenter(property: { latitude?: unknown; longitude?: unknown; city?: string | null; state?: string | null }): { lat: number; lng: number } | null {
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) return { lat: latitude, lng: longitude };
  const state = `${property.state || ""} ${property.city || ""}`.toLowerCase();
  if (state.includes("abuja") || state.includes("fct")) return { lat: 9.0765, lng: 7.3986 };
  if (state.includes("lagos")) return { lat: 6.5244, lng: 3.3792 };
  if (state.includes("ebonyi")) return { lat: 6.2649, lng: 8.0137 };
  return null;
}
