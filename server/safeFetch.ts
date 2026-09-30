import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 900_000;
const TIMEOUT_MS = 7_000;
const ALLOWED_CONTENT_TYPES = /^(text\/|application\/(xhtml\+xml|json|xml))/i;

export function isPrivateOrReservedIp(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  const version = net.isIP(normalized);
  if (version === 4) {
    const octets = normalized.split(".").map(Number);
    const [a, b] = octets;
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
  }
  if (version === 6) {
    const value = normalized.split("%")[0];
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") || value.startsWith("ff");
  }
  return true;
}

export function validatePublicHttpsUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only HTTPS websites can be enriched.");
  if (url.username || url.password) throw new Error("Website URLs must not contain userinfo.");
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || net.isIP(host) && isPrivateOrReservedIp(host)) throw new Error("Private, local, loopback, or reserved destinations are not allowed.");
  return url;
}

async function assertPublicResolution(url: URL) {
  const addresses = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateOrReservedIp(address))) throw new Error("The website resolves to a private or reserved network destination.");
}

async function readLimited(response: Response) {
  const length = Number(response.headers.get("content-length") || 0);
  if (length > MAX_BYTES) throw new Error("The website response is too large to inspect.");
  if (response.body) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); throw new Error("The website response is too large to inspect."); }
      chunks.push(value);
    }
    const merged = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder().decode(merged);
  }
  return (await response.text()).slice(0, MAX_BYTES);
}

export async function fetchPublicHttps(raw: string, fetchImpl: typeof fetch = fetch) {
  let url = validatePublicHttpsUrl(raw);
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicResolution(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetchImpl(url, { signal: controller.signal, redirect: "manual", headers: { "User-Agent": "EdgePark-Estate-Partnership-Research/1.0", Accept: "text/html,application/xhtml+xml,application/json" } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error("The website returned an invalid redirect.");
        url = validatePublicHttpsUrl(new URL(location, url).toString());
        continue;
      }
      if (!response.ok) throw new Error("The public website could not be reached.");
      const contentType = response.headers.get("content-type") || "";
      if (contentType && !ALLOWED_CONTENT_TYPES.test(contentType)) throw new Error("The website returned an unsupported content type.");
      return { url, response, body: await readLimited(response) };
    } finally { clearTimeout(timeout); }
    /* The guarded request above always returns or throws. */
  }
  throw new Error("Too many website redirects.");
}
