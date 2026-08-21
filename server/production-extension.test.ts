import { describe, expect, it } from "vitest";

function buildWhatsAppLink(phone: string, title: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello EdgeSpark, is ${title} still available? I’d like to know more about the property.`)}`;
}

function matchesNigeriaSearch(property: { title: string; address: string; neighborhood?: string; city: string; state: string; propertyType: string }, query: string) {
  const haystack = [property.title, property.address, property.neighborhood, property.city, property.state, property.propertyType].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

describe("production extension helpers", () => {
  it("creates an international WhatsApp availability link with a prefilled property message", () => {
    const link = buildWhatsAppLink("+234 801 234 5678", "Lekki Garden Residences");
    expect(link).toContain("https://wa.me/2348012345678");
    expect(decodeURIComponent(link)).toContain("is Lekki Garden Residences still available?");
  });

  it("matches Nigerian search by neighborhood, state, or property type", () => {
    const property = { title: "Ikoyi Development Parcel", address: "Bourdillon Road", neighborhood: "Ikoyi", city: "Lagos", state: "Lagos", propertyType: "land" };
    expect(matchesNigeriaSearch(property, "Ikoyi")).toBe(true);
    expect(matchesNigeriaSearch(property, "land")).toBe(true);
    expect(matchesNigeriaSearch(property, "Abuja")).toBe(false);
  });
});

import { buildDeveloperWhatsAppLink, buildPartnershipLeadPayload, buildPriceUpdateInput, buildPropertySearchInput, buildPropertyShareLink, buildGoogleMapsDirectionsUrl, getPropertyLocationExactness, getPropertyMapCenter, matchesPropertyFilters, matchesPropertySearch, reorderMediaIds, rotateMediaByDay, selectGalleryImage, shouldUseClipboardFallback } from "../shared/types";

describe("submitted search and partnership lead contracts", () => {
  it("serializes draft location and search criteria only when submitted", () => {
    expect(buildPropertySearchInput({ search: "villa", location: "Lekki", type: "all", status: "available", minPrice: 50000000, maxPrice: 200000000, transactionType: "buy" })).toEqual({ search: "villa Lekki", type: "all", status: "available", transactionType: "buy", minPrice: 50000000, maxPrice: 200000000 });
  });

  it("applies rent/buy and minimum/maximum price filters to fallback properties", () => {
    const rentApartment = { title: "Abuja Civic Apartments", address: "Maitama", city: "Maitama", state: "FCT", propertyType: "apartment", transactionType: "rent", status: "available", price: 92000000 };
    const buyApartment = { ...rentApartment, transactionType: "buy" };
    const filters = { search: "", location: "", type: "apartment", status: "available", minPrice: 80000000, maxPrice: 100000000, transactionType: "rent" as const };
    expect(matchesPropertyFilters(rentApartment, filters)).toBe(true);
    expect(matchesPropertyFilters(buyApartment, filters)).toBe(false);
    expect(matchesPropertyFilters({ ...rentApartment, price: 120000000 }, filters)).toBe(false);
  });

  it("normalizes admin guide-price updates and selects bounded gallery thumbnails", () => {
    expect(buildPriceUpdateInput(7, 185000000.9)).toEqual({ id: 7, price: 185000000 });
    expect(selectGalleryImage(["hero", "side", "garden"], 1)).toBe("side");
    expect(selectGalleryImage(["hero", "side", "garden"], 99)).toBe("garden");
  });

  it("rotates gallery media deterministically by day while preserving single-image galleries", () => {
    expect(rotateMediaByDay(["house-a", "house-b", "house-c"], 0)).toEqual(["house-a", "house-b", "house-c"]);
    expect(rotateMediaByDay(["house-a", "house-b", "house-c"], 1)).toEqual(["house-b", "house-c", "house-a"]);
    expect(rotateMediaByDay(["land-a"], 18)).toEqual(["land-a"]);
  });

  it("uses the clipboard fallback when WhatsApp cannot open", () => {
    expect(shouldUseClipboardFallback(false)).toBe(true);
    expect(shouldUseClipboardFallback(true)).toBe(false);
  });

  it("builds the listing-specific share URL used by property detail pages", () => {
    const link = buildPropertyShareLink("Lagos Waterfront Residence", "Lekki, Lagos", "https://edgespark.example/property/lagos-waterfront-residence");
    expect(decodeURIComponent(link)).toContain("Check out Lagos Waterfront Residence in Lekki, Lagos on EdgeSpark");
    expect(decodeURIComponent(link)).toContain("https://edgespark.example/property/lagos-waterfront-residence");
  });

  it("creates a listing-specific WhatsApp share URL", () => {
    const link = buildPropertyShareLink("Lagos Waterfront Residence", "Lekki, Lagos", "https://edgespark.example/property/lagos-waterfront-residence");
    expect(link).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(link)).toContain("Lagos Waterfront Residence");
    expect(decodeURIComponent(link)).toContain("https://edgespark.example/property/lagos-waterfront-residence");
  });

  it("routes the developer contact action to the requested WhatsApp inbox", () => {
    const link = buildDeveloperWhatsAppLink("Lagos Waterfront Residence");
    expect(link).toContain("https://wa.me/2348141997159");
    expect(decodeURIComponent(link)).toContain("Lagos Waterfront Residence");
  });

  it("matches a property by separate state, LGA, and street tokens", () => {
    const property = { title: "Lagos Waterfront Residence", address: "12 Admiralty Way", neighborhood: "Eti-Osa", city: "Lekki", state: "Lagos", propertyType: "duplex" };
    expect(matchesPropertySearch(property, "Lagos Lekki")).toBe(true);
    expect(matchesPropertySearch(property, "Eti-Osa Admiralty")).toBe(true);
    expect(matchesPropertySearch(property, "Abakaliki")).toBe(false);
  });

  it("keeps every partnership application field with the selected role", () => {
    const payload = buildPartnershipLeadPayload({ name: "Ada Investor", email: "ada@example.com", phone: "+2348012345678", company: "Ada Capital", investmentRange: "₦50m–₦100m", message: "I would like to explore a development partnership." }, "developer");
    expect(payload).toMatchObject({ role: "developer", name: "Ada Investor", email: "ada@example.com", phone: "+2348012345678", company: "Ada Capital", investmentRange: "₦50m–₦100m", message: "I would like to explore a development partnership." });
  });
});

describe("admin property and gallery governance contracts", () => {
  it("keeps transaction type and publishing fields in an edit payload", () => {
    expect({ id: 12, title: "Abuja Residence", transactionType: "rent", status: "available", published: true, price: 95000000 }).toMatchObject({ transactionType: "rent", status: "available", published: true });
  });

  it("keeps media order deterministic and exposes only approved sets publicly", async () => {
    const { buildGallerySetStatusInput, buildMediaReorderInput, shouldExposeGalleryToPublic } = await import("../shared/types");
    expect(buildGallerySetStatusInput(4, "approved")).toEqual({ id: 4, status: "approved" });
    expect(buildMediaReorderInput(8, [3, 1, 2])).toEqual({ propertyId: 8, orderedIds: [3, 1, 2] });
    expect(reorderMediaIds([1, 2, 3], 1, 3)).toEqual([2, 3, 1]);
    expect(shouldExposeGalleryToPublic(true, "approved")).toBe(true);
    expect(shouldExposeGalleryToPublic(true, "draft")).toBe(false);
    expect(shouldExposeGalleryToPublic(false, "approved")).toBe(false);
  });
});

describe("property map location contracts", () => {
  it("uses exact coordinates and directions when a listing has valid latitude and longitude", () => {
    const property = { latitude: "6.5244000", longitude: "3.3792000", address: "Victoria Island", city: "Lagos", state: "Lagos", country: "Nigeria" };
    expect(getPropertyLocationExactness(property)).toBe("exact");
    expect(getPropertyMapCenter(property)).toEqual({ lat: 6.5244, lng: 3.3792 });
    expect(buildGoogleMapsDirectionsUrl(property)).toContain("destination=6.5244%2C3.3792");
  });

  it("labels address-only listings approximate and routes them to a searchable Google Maps area", () => {
    const property = { address: "Maitama", city: "Abuja", state: "FCT", country: "Nigeria" };
    expect(getPropertyLocationExactness(property)).toBe("approximate");
    expect(getPropertyMapCenter(property)).toEqual({ lat: 9.0765, lng: 7.3986 });
    expect(buildGoogleMapsDirectionsUrl(property)).toContain("query=Maitama%2C%20Abuja%2C%20FCT%2C%20Nigeria");
  });

  it("does not fabricate a map center for a listing without location context", () => {
    const property = {};
    expect(getPropertyLocationExactness(property)).toBe("unavailable");
    expect(getPropertyMapCenter(property)).toBeNull();
    expect(buildGoogleMapsDirectionsUrl(property)).toBeNull();
  });
});
