export function normalizePropertyTags(value: unknown): string[] {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function matchesPropertyTag(value: unknown, activeTag: string): boolean {
  if (activeTag === "All") return true;
  return normalizePropertyTags(value).some((tag) => tag.toLowerCase() === activeTag.toLowerCase());
}

export function getTagSuggestions(currentValue: unknown, availableTags: string[], query: string): string[] {
  const existing = normalizePropertyTags(currentValue).map((tag) => tag.toLowerCase());
  const normalizedQuery = query.trim().toLowerCase();
  return availableTags
    .filter((tag) => !existing.includes(tag.toLowerCase()))
    .filter((tag) => !normalizedQuery || tag.toLowerCase().includes(normalizedQuery))
    .slice(0, 6);
}

export function appendTag(currentValue: unknown, tag: string): string {
  const next = normalizePropertyTags(currentValue);
  const trimmed = tag.trim();
  if (!trimmed || next.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return next.join(", ");
  return [...next, trimmed].join(", ");
}
