/**
 * EdgeSpark — Currency Localization
 *
 * Server-side: reads cf.country from request headers
 * Client-side: falls back to navigator.language + localStorage override
 *
 * Exchange rates from open.er-api.com (free, no key, hourly updates)
 * Cache in KV with 1h TTL
 */

export const CURRENCY_MAP: Record<
  string,
  { code: string; symbol: string; name: string; format: (n: number) => string }
> = {
  NG: {
    code: "NGN",
    symbol: "\u20A6",
    name: "Nigerian Naira",
    format: (n) => `\u20A6${n.toLocaleString("en-NG")}`,
  },
  US: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    format: (n) => `$${n.toLocaleString("en-US")}`,
  },
  GB: {
    code: "GBP",
    symbol: "\u00A3",
    name: "British Pound",
    format: (n) => `\u00A3${n.toLocaleString("en-GB")}`,
  },
  DE: {
    code: "EUR",
    symbol: "\u20AC",
    name: "Euro",
    format: (n) => `\u20AC${n.toLocaleString("de-DE")}`,
  },
  FR: {
    code: "EUR",
    symbol: "\u20AC",
    name: "Euro",
    format: (n) => `\u20AC${n.toLocaleString("fr-FR")}`,
  },
  AE: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    format: (n) => `AED ${n.toLocaleString("en-AE")}`,
  },
  ZA: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    format: (n) => `R ${n.toLocaleString("en-ZA")}`,
  },
  IN: {
    code: "INR",
    symbol: "\u20B9",
    name: "Indian Rupee",
    format: (n) => `\u20B9${n.toLocaleString("en-IN")}`,
  },
};

const DEFAULT_CURRENCY = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  format: (n: number) => `$${n.toLocaleString("en-US")}`,
};

export function getCurrency(countryCode: string | undefined | null) {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_MAP[countryCode] || DEFAULT_CURRENCY;
}

export function getCountryFromTimezone(timezone: string | undefined): string | null {
  if (!timezone) return null;
  const map: Record<string, string> = {
    "Africa/Lagos": "NG",
    "Africa/Abuja": "NG",
    "America/New_York": "US",
    "America/Chicago": "US",
    "America/Los_Angeles": "US",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Asia/Dubai": "AE",
    "Africa/Johannesburg": "ZA",
    "Asia/Kolkata": "IN",
  };
  return map[timezone] || null;
}

export function getCountryFromLanguage(lang: string | undefined): string | null {
  if (!lang) return null;
  const code = lang.split("-")[0]?.split("_")[0];
  const map: Record<string, string> = {
    en: "US",
    ha: "NG",
    ig: "NG",
    yo: "NG",
    fr: "FR",
    de: "DE",
    ar: "AE",
    af: "ZA",
    hi: "IN",
  };
  return map[code || ""] || null;
}

/**
 * Fetch exchange rates from open.er-api.com
 * In production, cache in KV with 1h TTL
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) return { NGN: 1500, GBP: 0.74, EUR: 0.87, AED: 3.67, ZAR: 18.5, INR: 83.5 };
    const data = await res.json();
    return data.rates || { NGN: 1500, GBP: 0.74, EUR: 0.87, AED: 3.67, ZAR: 18.5, INR: 83.5 };
  } catch {
    return { NGN: 1500, GBP: 0.74, EUR: 0.87, AED: 3.67, ZAR: 18.5, INR: 83.5 };
  }
}

export function convertFromNgn(
  amountNgn: number,
  targetCurrency: string,
  rates: Record<string, number>
): { amount: number; formatted: string } {
  if (targetCurrency === "NGN") {
    const curr = getCurrency("NG");
    return { amount: amountNgn, formatted: curr.format(amountNgn) };
  }

  const rate = rates[targetCurrency];
  if (!rate) {
    const curr = getCurrency("US");
    return { amount: amountNgn, formatted: curr.format(amountNgn) };
  }

  const amountUsd = amountNgn / (rates.NGN || 1500);
  const converted = amountUsd * rate;

  const countryMap: Record<string, string> = {
    USD: "US",
    GBP: "GB",
    EUR: "DE",
    AED: "AE",
    ZAR: "ZA",
    INR: "IN",
  };
  const curr = getCurrency(countryMap[targetCurrency] || "US");
  return {
    amount: Math.round(converted),
    formatted: curr.format(Math.round(converted)),
  };
}
