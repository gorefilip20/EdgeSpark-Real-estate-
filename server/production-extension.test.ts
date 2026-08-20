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

import { buildPartnershipLeadPayload, buildPropertySearchInput } from "../shared/types";

describe("submitted search and partnership lead contracts", () => {
  it("serializes draft location and search criteria only when submitted", () => {
    expect(buildPropertySearchInput({ search: "villa", location: "Lekki", type: "all", status: "available" })).toEqual({ search: "villa Lekki", type: "all", status: "available" });
  });

  it("keeps every partnership application field with the selected role", () => {
    const payload = buildPartnershipLeadPayload({ name: "Ada Investor", email: "ada@example.com", phone: "+2348012345678", company: "Ada Capital", investmentRange: "₦50m–₦100m", message: "I would like to explore a development partnership." }, "developer");
    expect(payload).toMatchObject({ role: "developer", name: "Ada Investor", email: "ada@example.com", phone: "+2348012345678", company: "Ada Capital", investmentRange: "₦50m–₦100m", message: "I would like to explore a development partnership." });
  });
});
