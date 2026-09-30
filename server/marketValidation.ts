import { getInternationalMarket, INTERNATIONAL_MARKET_CODES } from "@shared/internationalMarkets";

export const SUPPORTED_CURRENCIES = new Set(["NGN", "GBP", "USD", "CAD", "EUR", "AED", "ZAR", "JPY", "CNY", "INR", "AUD"]);
const PRIMARY_CURRENCY_BY_COUNTRY: Record<string, string> = {
  NG: "NGN", GB: "GBP", US: "USD", CA: "CAD", AE: "AED", ZA: "ZAR", JP: "JPY", CN: "CNY", IN: "INR", AU: "AUD",
};
const EURO_COUNTRIES = new Set(["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"]);

export function validateMarketCodes(countryCode: string, currencyCode: string) {
  const country = countryCode.trim().toUpperCase();
  const currency = currencyCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country) || !INTERNATIONAL_MARKET_CODES.has(country) || !getInternationalMarket(country)) throw new Error("Choose a supported ISO country code.");
  if (!/^[A-Z]{3}$/.test(currency) || !SUPPORTED_CURRENCIES.has(currency)) throw new Error("Choose a supported ISO currency code.");
  const expected = PRIMARY_CURRENCY_BY_COUNTRY[country] || (EURO_COUNTRIES.has(country) ? "EUR" : undefined);
  if (expected && expected !== currency) throw new Error(`Currency ${currency} is not the configured native currency for ${country}; choose ${expected}.`);
  return { countryCode: country, currencyCode: currency };
}

export function validatePriceRange(minPrice?: number, maxPrice?: number) {
  if (minPrice !== undefined && (!Number.isInteger(minPrice) || minPrice < 0)) throw new Error("Minimum price must be a non-negative integer.");
  if (maxPrice !== undefined && (!Number.isInteger(maxPrice) || maxPrice <= 0)) throw new Error("Maximum price must be a positive integer.");
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) throw new Error("Minimum price cannot exceed maximum price.");
}

export function marketCurrencyForCountry(countryCode: string) {
  const country = countryCode.toUpperCase();
  return PRIMARY_CURRENCY_BY_COUNTRY[country] || (EURO_COUNTRIES.has(country) ? "EUR" : undefined);
}
