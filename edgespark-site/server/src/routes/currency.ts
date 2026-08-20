const rateCache: { rates: Record<string, number> | null; expiresAt: number } = { rates: null, expiresAt: 0 };
/**
 * EdgeSpark — Currency API
 * GET /api/public/currency/rates   — Get exchange rates (cached)
 * POST /api/public/currency/convert — Convert NGN to target currency
 */

import { Hono } from "hono";
import { fetchExchangeRates, convertFromNgn, getCurrency, getCountryFromTimezone, getCountryFromLanguage } from "../lib/currency";

import { vars } from "edgespark";

const currency = new Hono();

// ============================================
// RATES (cached in KV, 1h TTL)
// ============================================
currency.get("/rates", async (c) => {
  const cached = rateCache.rates && rateCache.expiresAt > Date.now() ? rateCache.rates : null;
  if (cached) {
    return c.json({ ok: true, rates: cached, source: "cache" });
  }

  const rates = await fetchExchangeRates();
  rateCache.rates = rates; rateCache.expiresAt = Date.now() + 3600000;

  return c.json({ ok: true, rates, source: "live" });
});

// ============================================
// DETECT — Get user's currency from request
// ============================================
currency.get("/detect", (c) => {
  // Try cf.country first (Cloudflare Workers)
  const cfCountry = (c.req.raw as any).cf?.country as string | undefined;

  // Try timezone
  const tz = c.req.header("cf-timezone") || c.req.query("tz");
  const tzCountry = getCountryFromTimezone(tz);

  // Try accept-language
  const lang = c.req.header("accept-language")?.split(",")[0];
  const langCountry = getCountryFromLanguage(lang);

  const countryCode = cfCountry || tzCountry || langCountry || "US";
  const currency = getCurrency(countryCode);

  return c.json({
    ok: true,
    country: countryCode,
    currency: {
      code: currency.code,
      symbol: currency.symbol,
      name: currency.name,
    },
  });
});

// ============================================
// CONVERT — NGN to target currency
// ============================================
currency.post("/convert", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "invalid_body" }, 400);

  const { amountNgn, targetCurrency } = body as {
    amountNgn?: number;
    targetCurrency?: string;
  };

  if (typeof amountNgn !== "number" || !targetCurrency) {
    return c.json({ error: "missing_fields" }, 400);
  }

  // Get rates (try cache first)
  let rates = rateCache.rates && rateCache.expiresAt > Date.now() ? rateCache.rates : null as Record<string, number> | null;
  if (!rates) {
    rates = await fetchExchangeRates();
    rateCache.rates = rates; rateCache.expiresAt = Date.now() + 3600000;
  }

  const result = convertFromNgn(amountNgn, targetCurrency, rates);
  return c.json({ ok: true, ...result, currency: targetCurrency });
});

export default currency;
