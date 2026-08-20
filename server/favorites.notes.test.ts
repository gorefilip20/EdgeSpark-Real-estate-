import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { appendTag, getTagSuggestions, matchesPropertyTag, normalizePropertyTags } from "../client/src/lib/propertyTags";

function context(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("favorite notes and tags", () => {
  it("requires a signed-in account to update shortlist metadata", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.favorites.updateMetadata({ propertyId: 1, notes: "Watch title status", tags: "Lagos, land" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects notes and tags beyond the supported limits", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "visitor", name: "Visitor", email: "visitor@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.favorites.updateMetadata({ propertyId: 1, notes: "n".repeat(2001), tags: "Lagos" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.favorites.updateMetadata({ propertyId: 1, notes: "Note", tags: "t".repeat(501) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("shortlist tag filtering", () => {
  it("normalizes tags and matches case-insensitively", () => {
    expect(normalizePropertyTags("Lagos, high yield, Lagos")).toEqual(["Lagos", "high yield", "Lagos"]);
    expect(matchesPropertyTag("Lagos, high yield", "lagos")).toBe(true);
    expect(matchesPropertyTag("Abuja, land", "Lagos")).toBe(false);
    expect(matchesPropertyTag("Abuja, land", "All")).toBe(true);
    expect(getTagSuggestions("Lagos, ", ["Lagos", "High yield", "Land"], "hig")).toEqual(["High yield"]);
    expect(appendTag("Lagos, manual note", "High yield")).toBe("Lagos, manual note, High yield");
    expect(appendTag("Lagos", "lagos")).toBe("Lagos");
  });
});
