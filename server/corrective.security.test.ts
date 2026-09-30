import { describe, expect, it } from "vitest";
import { validateMarketCodes, validatePriceRange } from "./marketValidation";
import { isPrivateOrReservedIp, validatePublicHttpsUrl } from "./safeFetch";
import { getSessionCookieOptions } from "./_core/cookies";

describe("corrective security controls", () => {
  it("accepts configured native market currencies and rejects mismatches", () => {
    expect(validateMarketCodes("ng", "ngn")).toEqual({ countryCode: "NG", currencyCode: "NGN" });
    expect(() => validateMarketCodes("GB", "USD")).toThrow(/native currency/);
    expect(() => validateMarketCodes("ZZ", "USD")).toThrow(/supported ISO country/);
  });

  it("rejects invalid and inverted native-currency price ranges", () => {
    expect(() => validatePriceRange(500, 100)).toThrow(/cannot exceed/);
    expect(() => validatePriceRange(-1, 100)).toThrow(/non-negative/);
    expect(() => validatePriceRange(100, 500)).not.toThrow();
  });

  it("blocks local/private destinations and non-HTTPS URLs", () => {
    expect(() => validatePublicHttpsUrl("http://example.com")).toThrow(/HTTPS/);
    expect(() => validatePublicHttpsUrl("https://127.0.0.1")).toThrow(/Private/);
    expect(() => validatePublicHttpsUrl("https://user:pass@example.com")).toThrow(/userinfo/);
    expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
  });

  it("uses secure session cookie attributes on forwarded HTTPS requests", () => {
    const options = getSessionCookieOptions({ protocol: "http", headers: { "x-forwarded-proto": "https" } } as any);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  });
});
