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
