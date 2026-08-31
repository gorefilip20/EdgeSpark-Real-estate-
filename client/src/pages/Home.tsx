import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Switch, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  ArrowDownToLine,
  ArrowUpRight,
  Bath,
  BedDouble,
  Bookmark,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Filter,
  Globe2,
  Home as HomeIcon,
  Landmark,
  LayoutGrid,
  Link2,
  List,
  Mail,
  Linkedin,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import {
  buildDeveloperWhatsAppLink,
  buildPartnershipLeadPayload,
  buildPriceUpdateInput,
  buildPropertySearchInput,
  buildPropertyShareLink,
  matchesPropertyFilters,
  NIGERIA_LGAS,
  NIGERIA_STATES,
  NIGERIA_LOCATION_OPTIONS,
  reorderMediaIds,
  rotateMediaByDay,
  selectGalleryImage,
  shouldUseClipboardFallback,
  buildGoogleMapsDirectionsUrl,
  getPropertyLocationExactness,
  getPropertyMapCenter,
} from "@shared/types";
import { INTERNATIONAL_MARKETS } from "@shared/internationalMarkets";
import { trpc } from "@/lib/trpc";
import {
  appendTag,
  getTagSuggestions,
  matchesPropertyTag,
  normalizePropertyTags,
} from "@/lib/propertyTags";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { COOKIE_NAME } from "@shared/const";
import { toast } from "sonner";
const PUBLIC_GUIDES = [
  { title: "How to Make Money in Real Estate — EdgeSpark Estate", description: "Profit models, cash flow, financing, partnerships, and responsible investment decisions.", href: "/downloads/how-to-make-money-real-estate-edgespark-estate.pdf" },
  { title: "How to Source a Good Property and Verify Ownership — EdgeSpark Estate", description: "A practical checklist for title, seller identity, surveys, approvals, inspections, and documents.", href: "/downloads/how-to-source-verify-property-edgespark-estate.pdf" },
  { title: "How to Attract Buyers — EdgeSpark Estate", description: "Build trust, present property well, qualify enquiries, follow up, and improve conversion.", href: "/downloads/how-to-attract-buyers-edgespark-estate.pdf" },
  { title: "How to Build a Good Portfolio and Measure Return on Investment — EdgeSpark Estate", description: "Allocation, diversification, income, ROI measures, scenario analysis, reserves, and reporting.", href: "/downloads/how-to-build-portfolio-roi-edgespark-estate.pdf" },
  { title: "How to Market Real Estate to a Wider Audience — EdgeSpark Estate", description: "Brand, content, search, social media, partnerships, email, campaigns, and measurement.", href: "/downloads/how-to-market-real-estate-edgespark-estate.pdf" },
  { title: "About EdgePark Estate — EdgeSpark Estate", description: "Our customer promise, partnership model, responsible approach, and growth vision.", href: "/downloads/about-edgepark-estate.pdf" },
];
const demoProperties = [
  {
    id: 1,
    slug: "lagos-waterfront-residence",
    title: "Lagos Waterfront Residence",
    city: "Lekki",
    state: "Lagos",
    propertyType: "duplex",
    transactionType: "buy",
    status: "available",
    price: 185000000,
    bedrooms: 4,
    bathrooms: 5,
    areaSqm: 420,
    projectedRoi: "28",
    projectedYield: "11",
    featured: 1,
    published: 1,
    demo: true,
    description:
      "TEST LISTING — verify title, price, ownership, and availability before publishing. A private residence concept for premium rental demand and long-term appreciation.",
    media: [
      { url: "/manus-storage/edgespark-lagos-house_0089859c.jpg" },
      { url: "/manus-storage/edgespark-house-gallery-01_a3391b93.jpg" },
      { url: "/manus-storage/edgespark-house-gallery-04_835a7c5f.jpg" },
    ],
  },
  {
    id: 2,
    slug: "abuja-civic-apartments",
    title: "Abuja Civic Apartments",
    city: "Maitama",
    state: "FCT",
    propertyType: "apartment",
    transactionType: "rent",
    status: "available",
    price: 92000000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 210,
    projectedRoi: "22",
    projectedYield: "9",
    featured: 1,
    published: 1,
    demo: true,
    description:
      "TEST LISTING — verify title, price, ownership, and availability before publishing. A refined urban apartment concept for a high-demand diplomatic corridor.",
    media: [
      { url: "/manus-storage/edgespark-abuja-apartment_42bedea8.jpg" },
      { url: "/manus-storage/edgespark-house-gallery-02_5965af11.jpg" },
      { url: "/manus-storage/edgespark-house-gallery-03_292c1683.jpg" },
    ],
  },
  {
    id: 3,
    slug: "ikoyi-development-parcel",
    title: "Ikoyi Development Parcel",
    city: "Ikoyi",
    state: "Lagos",
    propertyType: "land",
    transactionType: "buy",
    status: "under_offer",
    price: 310000000,
    bedrooms: 0,
    bathrooms: 0,
    areaSqm: 850,
    projectedRoi: "35",
    projectedYield: "14",
    featured: 1,
    published: 1,
    demo: true,
    description:
      "TEST LISTING — verify title, price, ownership, and availability before publishing. A land parcel concept for boutique residential or hospitality development.",
    media: [
      { url: "/manus-storage/edgespark-nigeria-land_4cf2be9b.jpg" },
      { url: "/manus-storage/edgespark-land-gallery-01_5cbf2d8f.jpg" },
      { url: "/manus-storage/edgespark-nigeria-land_4cf2be9b.jpg" },
    ],
  },
];
const dayOfYear = () =>
  Math.floor(
    (Date.now() - new Date(new Date().getUTCFullYear(), 0, 0).getTime()) /
      86400000
  );
const dailyMedia = (media: any[] = []) => rotateMediaByDay(media, dayOfYear());
function ImageWithFallback({ src, alt, className, label }: { src?: string; alt: string; className: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`${className} flex items-center justify-center bg-gradient-to-br from-[#d7d9d0] via-[#b9c7c0] to-[#31525b] p-6 text-center text-2xl font-semibold text-white/90`}>{label}</div>;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}
const getVisitorCurrency = () => {
  if (typeof navigator === "undefined") return { currency: "NGN", locale: "en-NG", rate: 1 };
  const languages = [navigator.language, ...(navigator.languages || [])].filter(Boolean).map(value => value.replace("_", "-"));
  const region = languages.map(value => value.split("-")[1]?.toUpperCase()).find(Boolean) || "NG";
  const rates: Record<string, { currency: string; locale: string; rate: number }> = {
    NG: { currency: "NGN", locale: "en-NG", rate: 1 }, GB: { currency: "GBP", locale: "en-GB", rate: 1900 },
    US: { currency: "USD", locale: "en-US", rate: 1550 }, CA: { currency: "CAD", locale: "en-CA", rate: 1120 },
    JP: { currency: "JPY", locale: "ja-JP", rate: 10.5 }, CN: { currency: "CNY", locale: "zh-CN", rate: 215 },
    IN: { currency: "INR", locale: "en-IN", rate: 18.5 }, AU: { currency: "AUD", locale: "en-AU", rate: 1010 },
  };
  const euroRegions = new Set(["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"]);
  return euroRegions.has(region) ? { currency: "EUR", locale: "de-DE", rate: 1660 } : rates[region] || { currency: "USD", locale: "en-US", rate: 1550 };
};
const fmt = (value: number | string | null | undefined) => {
  const { currency, locale, rate } = getVisitorCurrency();
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value || 0) / rate);
};
const statusLabel = (status: string) => status.replace("_", " ");
const whatsappLink = (_phone: string | undefined, title: string) =>
  buildDeveloperWhatsAppLink(title);
const buildLeadEmailLink = (lead: any) => {
  const subject = `EdgePark follow-up: ${lead.role ? `${lead.role} partnership` : lead.propertyTitle || "property enquiry"}`;
  const body = `Hello ${lead.name || "there"},

Thank you for reaching out to EdgePark. I would like to continue the conversation about ${lead.propertyTitle || "your property opportunity"}.

Would you be available for a short call this week?

Best regards,
EdgePark Estate`;
  return `mailto:${encodeURIComponent(lead.email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
const copyPropertyLink = async (property: any) => {
  const propertyUrl = `${window.location.origin}/property/${property.slug}`;
  try {
    await navigator.clipboard.writeText(propertyUrl);
    toast.success("Copied", {
      description: "The property link was copied to your clipboard.",
      duration: 2200,
    });
  } catch {
    toast.error("Unable to copy link", {
      description: "Please copy the property URL from your browser.",
      duration: 2600,
    });
  }
};
const shareProperty = async (property: any) => {
  const propertyUrl = `${window.location.origin}/property/${property.slug}`;
  try {
    const opened = window.open(
      buildPropertyShareLink(
        property.title,
        `${property.city}, ${property.state}`,
        propertyUrl
      ),
      "_blank",
      "noopener,noreferrer"
    );
    if (!shouldUseClipboardFallback(Boolean(opened))) {
      toast.success("Listing ready to share on WhatsApp", {
        description: property.title,
        duration: 2200,
      });
      return;
    }
  } catch {}
  await copyPropertyLink(property);
};
function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${light ? "bg-[#bd7b4b]" : "bg-[#173b46]"}`}
      >
        <img src="/brand/edgepark-monogram.png" alt="" className="h-full w-full object-contain p-1.5" />
      </div>
      <div>
        <div
          className={`font-display text-lg font-semibold leading-none ${light ? "text-white" : "text-[#173b46]"}`}
        >
          EdgePark
        </div>
        <div
          className={`mt-1 text-[9px] font-bold uppercase tracking-[.25em] ${light ? "text-white/60" : "text-[#6c7776]"}`}
        >
          Estate capital
        </div>
      </div>
    </div>
  );
}
function Header({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`relative z-30 lg:absolute lg:left-0 lg:right-0 lg:top-0 ${dark ? "text-white" : "text-[#173b46]"}`}
    >
      <div className="container flex min-h-20 items-center justify-between py-4 lg:h-24 lg:py-0">
        <Link href="/">
          <BrandMark light={dark} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          <Link href="/properties">Explore properties</Link>
          <Link href="/about">About us</Link>
          <Link href="/calculator">Deal analyzer</Link>
          <Link href="/partner">Partner with us</Link>
          <Link href="/account">Account</Link>
          <Link href="/shortlist">Shortlist</Link>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => startLogin()}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold ${dark ? "border border-white/20" : "border border-[#173b46]/15"}`}
          >
            Sign in
          </button>
          <Link href="/partner">
            <Button className="rounded-full bg-[#bd7b4b] px-5 text-white hover:bg-[#a9663b]">
              Start a conversation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <button aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} className="rounded-full p-2 lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="container border-t border-white/10 bg-[#173b46] p-5 text-white shadow-xl lg:hidden">
          <div className="grid gap-4 text-sm">
            <Link href="/">Home</Link>
            <Link href="/properties">Explore properties</Link>
            <Link href="/about">About us</Link>
            <Link href="/calculator">Deal analyzer</Link>
            <Link href="/partner">Partner with us</Link>
            <Link href="/account">Account</Link>
            <Link href="/shortlist">Shortlist</Link>
          </div>
        </div>
      )}
    </header>
  );
}
function Footer() {
  return (
    <footer className="border-t border-[#deded5] bg-[#f1f0ea] py-12">
      <div className="container grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#6c7776]">
            Investment-grade property opportunities, thoughtful underwriting,
            and human partnership.
          </p>
        </div>
        <div>
          <div className="eyebrow">Explore</div>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/properties">Properties</Link>
            <Link href="/calculator">Deal analyzer</Link>
            <a href="#guides">Download guides</a>
          </div>
        </div>
        <div>
          <div className="eyebrow">Partner</div>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/partner">Investors</Link>
            <Link href="/partner">Owners & developers</Link>
            <Link href="/partner">Agents & realtors</Link>
          </div>
        </div>
        <div>
          <div className="eyebrow">Contact</div>
          <p className="mt-4 text-sm leading-6 text-[#6c7776]">
            Tell us what you are looking to build, acquire, or bring to market.
          </p>
          <Link
            href="/partner"
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#bd7b4b]"
          >
            Open a conversation <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <a href="https://x.com/EDGESPARKdu" target="_blank" rel="noreferrer" aria-label="EdgePark Estate on X" className="inline-flex items-center gap-2 text-[#173b46] hover:text-[#bd7b4b]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173b46] text-xs font-bold text-white">X</span>Follow us on X</a>
            <a href="https://www.linkedin.com/in/edgespark-realestate-95a232431/" target="_blank" rel="noreferrer" aria-label="EdgePark Estate on LinkedIn" className="inline-flex items-center gap-2 text-[#173b46] hover:text-[#bd7b4b]"><Linkedin className="h-7 w-7 rounded-full bg-[#173b46] p-1.5 text-white" />LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="container mt-10 border-t border-[#deded5] pt-5 text-xs text-[#6c7776]">
        © {new Date().getFullYear()} EdgePark Estate. All
        opportunities subject to independent review.
      </div>
    </footer>
  );
}
function FavoriteButton({ propertyId }: { propertyId: number }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: favorites = [] } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const save = trpc.favorites.save.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Saved to your shortlist");
    },
  });
  const remove = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Removed from shortlist");
    },
  });
  const saved = favorites.some((item: any) => item.id === propertyId);
  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    saved ? remove.mutate({ propertyId }) : save.mutate({ propertyId });
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      onClick={toggle}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") toggle(event as any);
      }}
      className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#173b46]/85 text-white backdrop-blur ${saved ? "text-[#d59462]" : ""}`}
    >
      <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
    </div>
  );
}
function FavoriteMetaEditor({
  property,
  availableTags = [],
}: {
  property: any;
  availableTags?: string[];
}) {
  const utils = trpc.useUtils();
  const [notes, setNotes] = useState(property.notes || "");
  const [tags, setTags] = useState(property.tags || "");
  const [tagDraft, setTagDraft] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const update = trpc.favorites.updateMetadata.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("Shortlist notes saved");
    },
  });
  const currentTags = normalizePropertyTags(tags);
  const suggestions = getTagSuggestions(tags, availableTags, tagDraft);
  const addTag = (tag: string) => {
    setTags(appendTag(tags, tag));
    setTagDraft("");
    setActiveSuggestion(0);
  };
  const saveMetadata = () => {
    const finalTags = tagDraft.trim() ? appendTag(tags, tagDraft) : tags;
    update.mutate({
      propertyId: property.id,
      notes: notes.trim() || null,
      tags: finalTags.trim() || null,
    });
  };
  return (
    <div
      className="mt-3 rounded-xl border border-[#deded5] bg-[#f8f7f3] p-3"
      onClick={event => event.stopPropagation()}
    >
      <div className="grid gap-2">
        <div className="relative">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {currentTags.map(tag => (
              <button
                type="button"
                key={tag}
                onClick={() =>
                  setTags(
                    normalizePropertyTags(tags)
                      .filter(item => item !== tag)
                      .join(", ")
                  )
                }
                className="rounded-full bg-[#d9e4df] px-2 py-1 text-[10px] font-semibold text-[#173b46]"
              >
                {tag} ×
              </button>
            ))}
          </div>
          <input
            value={tagDraft}
            onChange={event => {
              setTagDraft(event.target.value);
              setActiveSuggestion(0);
            }}
            onKeyDown={event => {
              if (event.key === "ArrowDown" && suggestions.length) {
                event.preventDefault();
                setActiveSuggestion(index => (index + 1) % suggestions.length);
              } else if (event.key === "ArrowUp" && suggestions.length) {
                event.preventDefault();
                setActiveSuggestion(
                  index => (index - 1 + suggestions.length) % suggestions.length
                );
              } else if (
                event.key === "Enter" &&
                suggestions[activeSuggestion]
              ) {
                event.preventDefault();
                addTag(suggestions[activeSuggestion]);
              } else if (event.key === "Escape") {
                setTagDraft("");
              }
            }}
            placeholder="Reuse or add a tag…"
            aria-label="Add property tag"
            aria-autocomplete="list"
            aria-controls={`tag-suggestions-${property.id}`}
            className="w-full rounded-lg border border-[#deded5] bg-white px-3 py-2 text-xs text-[#173b46] outline-none focus:border-[#bd7b4b]"
          />
          {suggestions.length > 0 && (
            <div
              id={`tag-suggestions-${property.id}`}
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#deded5] bg-white p-1 shadow-lg"
            >
              {suggestions.map((tag, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeSuggestion}
                  key={tag}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => addTag(tag)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-xs text-[#173b46] ${index === activeSuggestion ? "bg-[#f1f0ea]" : "hover:bg-[#f1f0ea]"}`}
                >
                  Reuse <span className="font-semibold">{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Add a private note about this opportunity…"
          rows={2}
          className="resize-none rounded-lg border border-[#deded5] bg-white px-3 py-2 text-xs text-[#173b46] outline-none focus:border-[#bd7b4b]"
        />
        <button
          disabled={update.isPending}
          onClick={saveMetadata}
          className="justify-self-start rounded-full bg-[#173b46] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save notes"}
        </button>
      </div>
    </div>
  );
}
function FavoriteMetaSummary({ property }: { property: any }) {
  const tags = normalizePropertyTags(property.tags);
  return (
    <div className="mt-3 grid gap-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-[#d9e4df] px-2 py-1 text-[10px] font-semibold text-[#173b46]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {property.notes && (
        <p className="line-clamp-2 text-xs leading-5 text-[#6c7776]">
          {property.notes}
        </p>
      )}
    </div>
  );
}
function ShortlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const { data: favorites = [], isLoading } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const availableTags = Array.from(
    new Set(
      favorites.flatMap((property: any) => normalizePropertyTags(property.tags))
    )
  ).sort();
  const filteredFavorites = favorites.filter((property: any) =>
    matchesPropertyTag(property.tags, activeTag)
  );
  const selected = filteredFavorites.filter((property: any) =>
    compareIds.includes(property.id)
  );
  const toggleCompare = (id: number) =>
    setCompareIds(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : current.length < 3
          ? [...current, id]
          : current
    );
  return (
    <div className="min-h-screen bg-[#f1f0ea]">
      <div className="bg-[#173b46] pb-16 pt-28 text-white">
        <Header dark />
        <div className="container">
          <div className="eyebrow text-[#d59462]">Your shortlist</div>
          <h1 className="mt-4 font-display text-5xl">
            The places worth revisiting.
          </h1>
          <p className="mt-5 max-w-xl text-white/65">
            Save properties, then compare up to three opportunities side by side
            before opening a conversation.
          </p>
        </div>
      </div>
      <main className="container py-14">
        {loading || isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-sm text-[#6c7776]">
            Loading your shortlist…
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-auto max-w-lg rounded-[1.5rem] border border-[#deded5] bg-white p-8 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-[#bd7b4b]" />
            <h2 className="mt-4 font-display text-3xl text-[#173b46]">
              Sign in to save properties.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6c7776]">
              Create an account or sign in to keep a private shortlist across
              visits.
            </p>
            <Button
              onClick={() => startLogin()}
              className="mt-6 rounded-full bg-[#173b46] text-white"
            >
              Create account / sign in
            </Button>
          </div>
        ) : favorites.length ? (
          <div>
            <div className="rounded-[1.4rem] border border-[#deded5] bg-white p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="eyebrow">Compare saved opportunities</div>
                  <h2 className="mt-2 font-display text-2xl text-[#173b46]">
                    Choose up to three properties.
                  </h2>
                  <p className="mt-2 text-sm text-[#6c7776]">
                    {selected.length
                      ? `${selected.length} selected`
                      : "Select properties below to compare price, size, return, and location."}
                  </p>
                </div>
                <button
                  onClick={() => setCompareIds([])}
                  className="text-sm font-semibold text-[#bd7b4b]"
                >
                  Clear selection
                </button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#ebe9e1] pt-5">
                <span className="mr-1 text-xs font-semibold uppercase tracking-[.12em] text-[#6c7776]">
                  Filter by tag
                </span>
                <button
                  onClick={() => {
                    setActiveTag("All");
                    setCompareIds([]);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${activeTag === "All" ? "border-[#173b46] bg-[#173b46] text-white" : "border-[#deded5] bg-white text-[#173b46]"}`}
                >
                  All
                </button>
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTag(tag);
                      setCompareIds([]);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${activeTag === tag ? "border-[#173b46] bg-[#173b46] text-white" : "border-[#deded5] bg-white text-[#173b46]"}`}
                  >
                    {tag}
                  </button>
                ))}
                {activeTag !== "All" && (
                  <button
                    onClick={() => {
                      setActiveTag("All");
                      setCompareIds([]);
                    }}
                    className="ml-auto text-xs font-semibold text-[#bd7b4b]"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {filteredFavorites.map((property: any) => (
                  <button
                    key={property.id}
                    onClick={() => toggleCompare(property.id)}
                    className={`rounded-full border px-4 py-2 text-sm ${compareIds.includes(property.id) ? "border-[#173b46] bg-[#173b46] text-white" : "border-[#deded5] bg-[#f8f7f3] text-[#173b46]"}`}
                  >
                    {compareIds.includes(property.id) ? "✓ " : ""}
                    {property.title}
                  </button>
                ))}
              </div>
            </div>
            {selected.length > 0 && (
              <div className="mt-8 overflow-x-auto rounded-[1.4rem] border border-[#deded5] bg-white">
                <div className="min-w-[720px] p-6">
                  <div className="eyebrow">Side-by-side view</div>
                  <div
                    className="mt-5 grid gap-3"
                    style={{
                      gridTemplateColumns: `160px repeat(${selected.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    <div />
                    <div className="contents">
                      {selected.map((property: any) => (
                        <div key={property.id}>
                          <div className="h-28 overflow-hidden rounded-xl bg-[#d7d9d0]">
                            {property.media?.[0]?.url ? (
                              <img
                                src={property.media[0].url}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="hero-grid h-full bg-[#31525b]" />
                            )}
                          </div>
                          <div className="mt-3 font-display text-lg text-[#173b46]">
                            {property.title}
                          </div>
                          <Link
                            href={`/property/${property.slug}`}
                            className="mt-2 inline-flex text-xs font-semibold text-[#bd7b4b]"
                          >
                            View details <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                          <FavoriteMetaSummary property={property} />
                        </div>
                      ))}
                    </div>
                    <div className="contents text-sm text-[#6c7776]">
                      <div className="font-semibold text-[#173b46]">
                        Guide price
                      </div>
                      {selected.map((property: any) => (
                        <div
                          key={property.id}
                          className="rounded-lg bg-[#f8f7f3] p-3 font-semibold text-[#173b46]"
                        >
                          {fmt(property.price)}
                        </div>
                      ))}
                      <div className="font-semibold text-[#173b46]">
                        Location
                      </div>
                      {selected.map((property: any) => (
                        <div key={property.id} className="p-3">
                          {property.city}, {property.state}
                        </div>
                      ))}
                      <div className="font-semibold text-[#173b46]">
                        Type / status
                      </div>
                      {selected.map((property: any) => (
                        <div key={property.id} className="p-3">
                          {property.propertyType} ·{" "}
                          {statusLabel(property.status)}
                        </div>
                      ))}
                      <div className="font-semibold text-[#173b46]">Size</div>
                      {selected.map((property: any) => (
                        <div key={property.id} className="p-3">
                          {property.areaSqm || "—"} m²
                        </div>
                      ))}
                      <div className="font-semibold text-[#173b46]">
                        Projected ROI
                      </div>
                      {selected.map((property: any) => (
                        <div
                          key={property.id}
                          className="p-3 font-semibold text-[#bd7b4b]"
                        >
                          {property.projectedRoi || "—"}%
                        </div>
                      ))}
                      <div className="font-semibold text-[#173b46]">
                        Projected yield
                      </div>
                      {selected.map((property: any) => (
                        <div
                          key={property.id}
                          className="p-3 font-semibold text-[#bd7b4b]"
                        >
                          {property.projectedYield || "—"}%
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFavorites.length ? (
                filteredFavorites.map((property: any) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} />
                    <FavoriteMetaEditor
                      property={property}
                      availableTags={availableTags}
                    />
                    <button
                      onClick={() => toggleCompare(property.id)}
                      className={`absolute bottom-5 right-5 z-10 rounded-full px-3 py-2 text-xs font-semibold ${compareIds.includes(property.id) ? "bg-[#173b46] text-white" : "bg-white text-[#173b46] shadow"}`}
                    >
                      {compareIds.includes(property.id)
                        ? "Selected"
                        : "Compare"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-[1.4rem] border border-dashed border-[#deded5] bg-white p-8 text-center text-sm text-[#6c7776]">
                  No saved properties match this tag.{" "}
                  <button
                    onClick={() => {
                      setActiveTag("All");
                      setCompareIds([]);
                    }}
                    className="font-semibold text-[#bd7b4b]"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-lg rounded-[1.5rem] border border-dashed border-[#deded5] bg-white p-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-[#bd7b4b]" />
            <h2 className="mt-4 font-display text-3xl text-[#173b46]">
              Your shortlist is empty.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6c7776]">
              Save a property from the listings page to see it here.
            </p>
            <Link href="/properties">
              <Button className="mt-6 rounded-full bg-[#173b46] text-white">
                Explore properties
              </Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
function PropertyGallery({ property }: { property: any }) {
  const images = dailyMedia(property.media || []);
  const [selected, setSelected] = useState(0);
  const current = selectGalleryImage(images, selected)?.url || images[0]?.url;
  return (
    <div>
      <div className="relative h-[360px] overflow-hidden rounded-[1.4rem] bg-[#d7d9d0] md:h-[500px]">
        {current ? (
          <ImageWithFallback src={current} alt={property.title} label={property.title.slice(0, 2).toUpperCase()} className="h-full w-full object-cover" />
        ) : (
          <div className="hero-grid h-full bg-[#31525b]" />
        )}
        <div className="absolute bottom-4 left-4 rounded-full bg-[#173b46]/90 px-3 py-1 text-xs text-white">
          {images.length} views · updates daily
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image: any, index: number) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => setSelected(index)}
              className={`h-16 overflow-hidden rounded-lg border-2 ${selected === index ? "border-[#bd7b4b]" : "border-transparent"}`}
              aria-label={`View image ${index + 1} of ${property.title}`}
            >
              <ImageWithFallback src={image.url} alt="" label={`${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function PropertyCard({ property }: { property: any }) {
  const image = dailyMedia(property.media)?.[0]?.url;
  return (
    <Link href={`/property/${property.slug}`}>
      <article className="card-lift overflow-hidden rounded-[1.4rem] border border-[#deded5] bg-white">
        <div className="relative h-56 overflow-hidden bg-[#d7d9d0]">
          <FavoriteButton propertyId={property.id} />
          <button
            type="button"
            aria-label={`Share ${property.title} on WhatsApp`}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              void shareProperty(property);
            }}
            className="absolute right-16 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow"
            title="Share on WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Copy ${property.title} link`}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              void copyPropertyLink(property);
            }}
            className="absolute right-28 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#173b46]/85 text-white shadow backdrop-blur"
            title="Copy link"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <ImageWithFallback src={image} alt={property.title} label={property.title.slice(0, 2).toUpperCase()} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge className="border-0 bg-white/90 text-[#173b46]">
              {statusLabel(property.status)}
            </Badge>
            {property.featured ? (
              <Badge className="border-0 bg-[#bd7b4b] text-white">
                Featured
              </Badge>
            ) : null}
          </div>
          <div className="absolute bottom-4 left-4 rounded-full bg-[#173b46]/90 px-3 py-1 text-xs text-white">
            {property.city}, {property.state}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.16em] text-[#bd7b4b]">
                {property.propertyType}
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-[#173b46]">
                {property.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {buildGoogleMapsDirectionsUrl(property) ? <a href={buildGoogleMapsDirectionsUrl(property) || undefined} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="inline-flex items-center gap-1 rounded-full border border-[#deded5] px-3 py-2 text-xs font-semibold text-[#173b46] hover:bg-[#f1f0ea]"><MapPin className="h-3.5 w-3.5" />Map</a> : null}
              <ArrowRight className="mt-1 h-5 w-5 text-[#bd7b4b]" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4 text-sm text-[#6c7776]">
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {property.bedrooms || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms || "—"}
            </span>
            <span>{property.areaSqm || "—"} m²</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[#ebe9e1] pt-4">
            <div>
              <div className="text-xs text-[#6c7776]">Guide price</div>
              <div className="mt-1 text-lg font-bold text-[#173b46]">
                {fmt(property.price)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#6c7776]">Projected ROI</div>
              <div className="mt-1 text-lg font-bold text-[#bd7b4b]">
                {property.projectedRoi || "—"}%
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
function LocalAccountForm({ admin = false }: { admin?: boolean }) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = trpc.auth.register.useMutation();
  const login = trpc.auth.login.useMutation();
  const pending = register.isPending || login.isPending;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submittedName = String(formData.get("name") || name).trim();
    const submittedEmail = String(formData.get("email") || email).trim().toLowerCase();
    const submittedPassword = String(formData.get("password") || password);
    setName(submittedName);
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    if (mode === "register" && submittedName.length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!submittedEmail || !/^\S+@\S+\.\S+$/.test(submittedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (submittedPassword.length < 8) {
      setError(mode === "register" ? "Choose a password with at least 8 characters." : "Enter your password before signing in.");
      return;
    }
    try {
      const result = mode === "register"
        ? await register.mutateAsync({ name: submittedName, email: submittedEmail, password: submittedPassword })
        : await login.mutateAsync({ email: submittedEmail, password: submittedPassword });
      if (admin && result.role !== "admin") {
        setError("This account is not an administrator. Use the owner email configured in Hostinger.");
        return;
      }
      // Preserve a same-tab bearer fallback if Hostinger or a mobile browser
      // omits the freshly-set HttpOnly cookie during this navigation.
      if (result.sessionToken) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${result.sessionToken}`);
        } catch {}
      }
      utils.auth.me.setData(undefined, result as any);
      // Keep the authenticated query cache during the route transition. A full
      // reload can race the Set-Cookie response on Hostinger/mobile browsers.
      navigate(admin ? "/admin" : "/account");
    } catch (err: any) {
      setError(err?.message || "We could not complete that request. Please try again.");
    }
  };
  return <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
    {mode === "register" && <Input required minLength={2} name="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" />}
    <Input required name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" />
    <Input required minLength={8} name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} onInput={e => setPassword(e.currentTarget.value)} placeholder="Password (8+ characters)" autoComplete={mode === "register" ? "new-password" : "current-password"} autoCapitalize="none" spellCheck={false} />
    {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    <Button type="submit" disabled={pending} className="w-full rounded-full bg-[#bd7b4b] py-6 text-white">
      {pending ? "Please wait…" : mode === "register" ? "Create account" : admin ? "Sign in as admin" : "Sign in"}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
    <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="w-full text-sm font-semibold text-[#173b46] underline-offset-4 hover:underline">
      {mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
    </button>
    {!admin ? <button type="button" onClick={() => startLogin()} className="w-full text-sm text-[#6c7776] hover:text-[#173b46]">Continue with connected provider</button> : null}
  </form>;
}
function AccountPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f1f0ea]">
      <div className="relative bg-[#173b46] pb-16 pt-28 text-white">
        <Header dark />
        <div className="container">
          <div className="eyebrow text-[#d59462]">Your EdgePark account</div>
          <h1 className="mt-4 max-w-2xl font-display text-5xl">
            Save properties. Continue conversations.
          </h1>
          <p className="mt-5 max-w-xl text-white/65">
            Create an account to keep your shortlist and make future property
            inquiries easier.
          </p>
        </div>
      </div>
      <main className="container grid min-h-[440px] place-items-center py-14">
        <div className="w-full max-w-lg rounded-[1.5rem] border border-[#deded5] bg-white p-8 shadow-sm">
          {loading ? (
            <p className="text-sm text-[#6c7776]">Checking your account…</p>
          ) : isAuthenticated ? (
            <div>
              <div className="eyebrow">Signed in</div>
              <h2 className="mt-3 font-display text-3xl text-[#173b46]">
                Welcome back{user?.name ? `, ${user.name}` : ""}.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6c7776]">
                Your secure session is active. Continue exploring properties or
                sign out below.
              </p>
              <div className="mt-7 flex gap-3">
                <Link href="/properties">
                  <Button className="rounded-full bg-[#173b46] text-white">
                    Explore properties
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="rounded-full"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="eyebrow">Create or access account</div>
              <h2 className="mt-3 font-display text-3xl text-[#173b46]">
                Your shortlist, saved securely.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#6c7776]">
                Create an account with your email and password, then return to your saved properties and enquiries from any device.
              </p>
              <LocalAccountForm />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
function AdminLoginPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!loading && user?.role === "admin") navigate("/admin");
  }, [loading, user, navigate]);
  return (
    <div className="min-h-screen bg-[#173b46] text-white">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-[1.5rem] border border-white/15 bg-white/10 p-8 backdrop-blur-md">
          <BrandMark light />
          <div className="eyebrow mt-10 text-[#d59462]">
            Private admin access
          </div>
          <h1 className="mt-4 font-display text-4xl">
            Operations, securely separated.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Only accounts assigned the admin role can enter the listing and lead
            workspace. Public visitors are redirected away from the dashboard.
          </p>
          {loading ? (
            <p className="mt-8 text-sm text-white/60">Checking access…</p>
          ) : user?.role === "admin" ? (
            <p className="mt-8 text-sm text-[#d59462]">
              Admin session detected. Opening workspace…
            </p>
          ) : (
            <LocalAccountForm admin />
          )}
          <Link
            href="/"
            className="mt-6 block text-center text-sm text-white/55 hover:text-white"
          >
            Return to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
function FounderSection() {
  const founders = [
    {
      initials: "EU",
      name: "Evarestus Chinecherem Ugwuokanya",
      role: "Founder & Managing Director",
      bio: "Leads deal sourcing, property acquisition, and on-the-ground operations, bringing disciplined diligence to each opportunity.",
      email: "evarestusuchinecherem@gmail.com",
      linkedin: "https://www.linkedin.com/in/evarestus-chinecherem-4269a5363",
      image: "/team/evaristus-chinyere.jpg",
    },
    {
      initials: "BI",
      name: "Benjamin Chisom Ikwuagwu",
      role: "Co-founder",
      bio: "Drives financial analysis, investor relations, and deal structuring so every opportunity is evaluated with clarity.",
      email: "benjamin.c.ikwuagwu@gmail.com",
      linkedin: "https://www.linkedin.com/in/ben-ikwuagwu-52918a306",
      image: "/team/benjamin.jpg",
    },
  ];
  return (
    <section className="bg-[#173b46] py-24 text-white">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="eyebrow text-[#d59462]">
            The people behind the perspective
          </div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Meet the founders.
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/65">
            Two complementary perspectives across sourcing, operations,
            financial analysis, and investor relationships.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {founders.map(founder => (
            <article
              key={founder.name}
              className="rounded-[1.4rem] border border-white/15 bg-white/[.06] p-7 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#d59462]/60 bg-[#bd7b4b]">
                  <ImageWithFallback src={founder.image} alt={`${founder.name} portrait`} label={founder.initials} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-display text-2xl">{founder.name}</h3>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.16em] text-[#d59462]">
                    {founder.role}
                  </div>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-white/65">
                {founder.bio}
              </p>
              <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                <a
                  href={`mailto:${founder.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#d59462] hover:text-[#d59462]"
                  aria-label={`Email ${founder.name}`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#d59462] hover:text-[#d59462]"
                  aria-label={`Open LinkedIn for ${founder.name}`}
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function AboutPage() {
  const founders = [
    {
      name: "Evarestus Chinecherem Ugwuokanya",
      role: "Founder & Managing Director",
      image: "/team/evaristus-chinyere.jpg",
      body: "Evarestus leads deal sourcing, property acquisition, and on-the-ground operations. His work is grounded in disciplined diligence: understanding the asset, the location, the use case, and the path from acquisition to long-term value.",
    },
    {
      name: "Benjamin Chisom Ikwuagwu",
      role: "Co-founder",
      image: "/team/benjamin.jpg",
      body: "Benjamin leads financial analysis, investor relations, and deal structuring. He brings a clear, measured lens to opportunity sizing, capital conversations, and the details that help partners move with confidence.",
    },
  ];
  return (
    <div className="min-h-screen bg-[#f1f0ea]">
      <section className="relative overflow-hidden bg-[#173b46] pb-20 pt-32 text-white">
        <Header dark />
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="container relative">
          <div className="eyebrow text-[#d59462]">About EdgePark</div>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight md:text-7xl">
            A clearer way to build around better places.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
            EdgePark Estate brings together carefully sourced
            opportunities, practical analysis, and human partnership for
            investors, owners, agents, developers, and realtors.
          </p>
        </div>
      </section>
      <main className="container py-16 md:py-24">
        <section className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <div className="eyebrow">Our mission</div>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#173b46] md:text-5xl">
              Make real estate decisions feel more considered.
            </h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-[#6c7776]">
            <p>
              We believe property decisions deserve more than noise, rushed
              assumptions, or disconnected transactions. Our mission is to make
              the path from opportunity to conviction clearer by combining local
              context, careful presentation, and transparent conversations.
            </p>
            <p>
              Whether someone is evaluating a home, land, development
              opportunity, or a long-term partnership, EdgePark creates a
              thoughtful first surface for understanding what matters before the
              next move.
            </p>
          </div>
        </section>
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.4rem] bg-white p-7 shadow-sm">
            <div className="eyebrow">01</div>
            <h3 className="mt-5 font-display text-2xl text-[#173b46]">
              Evidence over noise
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#6c7776]">
              We frame location, demand, pricing, and use case so the
              conversation starts from something tangible.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[#173b46] p-7 text-white">
            <div className="eyebrow text-[#d59462]">02</div>
            <h3 className="mt-5 font-display text-2xl">
              Partnership by design
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              We make room for capital, land, expertise, and distribution to
              meet in the right structure.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[#d9e4df] p-7">
            <div className="eyebrow">03</div>
            <h3 className="mt-5 font-display text-2xl text-[#173b46]">
              Long-view thinking
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#31525b]">
              We care about the story after the transaction: stewardship,
              clarity, and durable value.
            </p>
          </div>
        </section>
        <section className="mt-20">
          <div className="eyebrow">The people behind the perspective</div>
          <h2 className="mt-4 max-w-2xl font-display text-4xl text-[#173b46] md:text-5xl">
            Complementary strengths, one point of view.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {founders.map(founder => (
              <article
                key={founder.name}
                className="rounded-[1.5rem] border border-[#deded5] bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <ImageWithFallback src={founder.image} alt={`${founder.name} portrait`} label={founder.name.slice(0, 2).toUpperCase()} className="h-24 w-24 rounded-full border-2 border-[#d59462] object-cover" />
                  <div>
                    <h3 className="font-display text-2xl text-[#173b46]">
                      {founder.name}
                    </h3>
                    <div className="mt-2 text-xs font-bold uppercase tracking-[.16em] text-[#bd7b4b]">
                      {founder.role}
                    </div>
                  </div>
                </div>
                <p className="mt-7 text-sm leading-7 text-[#6c7776]">
                  {founder.body}
                </p>
                <div className="mt-7 border-t border-[#ebe9e1] pt-5">
                  <Link
                    href="/partner"
                    className="inline-flex items-center text-sm font-semibold text-[#bd7b4b]"
                  >
                    Start a conversation <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
function HomePage() {
  const { data } = trpc.properties.featured.useQuery();
  const properties = (data?.length ? data : demoProperties).slice(0, 3);
  return (
    <div>
      <section className="relative overflow-hidden bg-[#173b46] text-white lg:min-h-[730px]">
        <Header dark />
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="container relative grid items-start gap-12 pb-14 pt-14 sm:gap-14 sm:pb-16 lg:min-h-[730px] lg:items-center lg:grid-cols-[1.1fr_.9fr] lg:pb-16 lg:pt-32">
          <div>
            <div className="eyebrow">Property, with perspective</div>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.85rem,11vw,4.5rem)] leading-[1.02] tracking-[-.04em] sm:mt-6 md:text-7xl">
              Build wealth around{" "}
              <span className="text-[#d59462]">better places.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:mt-7 sm:text-lg sm:leading-8">
              Discover carefully selected real estate opportunities, understand
              the numbers, and speak directly with a team that thinks beyond the
              transaction.
            </p>
            <div className="mt-8 grid max-w-md gap-3 sm:mt-9 sm:flex sm:max-w-none sm:flex-wrap">
              <Link href="/properties">
                <Button className="w-full rounded-full bg-[#bd7b4b] px-6 py-6 text-white hover:bg-[#a9663b] sm:w-auto">
                  Explore opportunities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/partner">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/25 bg-transparent px-6 py-6 text-white hover:bg-white/10 sm:w-auto"
                >
                  Partner with EdgePark
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6 sm:mt-16 sm:gap-6">
              <div>
                <div className="font-display text-3xl">01</div>
                <div className="mt-1 text-xs uppercase tracking-[.15em] text-white/55">
                  Curated access
                </div>
              </div>
              <div>
                <div className="font-display text-3xl">02</div>
                <div className="mt-1 text-xs uppercase tracking-[.15em] text-white/55">
                  Clear analysis
                </div>
              </div>
              <div>
                <div className="font-display text-3xl">03</div>
                <div className="mt-1 text-xs uppercase tracking-[.15em] text-white/55">
                  Human advice
                </div>
              </div>
            </div>
          </div>
          <div className="relative hidden h-[470px] lg:block">
            <div className="absolute inset-12 rounded-[2rem] border border-white/15 bg-[#bd7b4b]/20" />
            <div className="absolute right-4 top-0 h-72 w-72 rounded-full border border-[#d59462]/30" />
            <div className="absolute bottom-0 left-0 w-[88%] rounded-[1.6rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[#d59462]">Investor brief</span>
                <TrendingUp className="h-5 w-5 text-[#d59462]" />
              </div>
              <div className="mt-10 font-display text-4xl">The long view.</div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
                Access opportunities selected for location quality, demand
                depth, and the story the numbers can support.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="text-2xl font-semibold">12.4%</div>
                  <div className="mt-1 text-xs text-white/50">
                    Illustrative yield
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="text-2xl font-semibold">4.8×</div>
                  <div className="mt-1 text-xs text-white/50">
                    Demand signal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="eyebrow">The EdgePark lens</div>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-[#173b46] md:text-5xl">
                Good property is more than a postcode.
              </h2>
            </div>
            <Link
              href="/properties"
              className="flex items-center gap-2 text-sm font-bold text-[#bd7b4b]"
            >
              View all properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[#ebe9e1] p-7">
              <Landmark className="h-7 w-7 text-[#bd7b4b]" />
              <h3 className="mt-10 font-display text-2xl text-[#173b46]">
                Evidence over noise
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#6c7776]">
                We turn location, demand, price, and upside into a clearer
                decision surface.
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[#173b46] p-7 text-white">
              <Globe2 className="h-7 w-7 text-[#d59462]" />
              <h3 className="mt-10 font-display text-2xl">
                Local knowledge, wider lens
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Work with a team that understands the nuance behind the market
                headline.
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[#d9e4df] p-7">
              <Users className="h-7 w-7 text-[#173b46]" />
              <h3 className="mt-10 font-display text-2xl text-[#173b46]">
                Partnerships that compound
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#31525b]">
                Bring capital, land, development, or reach. We’ll explore the
                right structure together.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#f1f0ea] py-24">
        <div className="container">
          <div className="eyebrow">Featured opportunities</div>
          <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 className="max-w-xl font-display text-4xl text-[#173b46] md:text-5xl">
              A considered shortlist for your next move.
            </h2>
            <Link href="/properties">
              <Button
                variant="outline"
                className="w-fit rounded-full border-[#173b46]/20"
              >
                Browse the collection <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {properties.map((property: any) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
      <section id="guides" className="bg-[#173b46] py-16 text-white">
        <div className="container">
          <div className="eyebrow text-[#d59462]">Free EdgePark library</div>
          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h2 className="font-display text-3xl leading-tight sm:text-4xl">Practical guides for better property decisions.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Download the six-part EdgePark Estate library for investing, sourcing, buyer attraction, portfolio planning, marketing, and our company story.</p></div></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{PUBLIC_GUIDES.map((guide, index) => <article key={guide.href} className="flex flex-col justify-between rounded-2xl bg-white/10 p-5"><div><div className="text-xs font-semibold uppercase tracking-[.16em] text-[#d59462]">Guide {index + 1}</div><h3 className="mt-3 font-display text-xl leading-tight">{guide.title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{guide.description}</p></div><a href={guide.href} download className="mt-5 inline-flex w-fit items-center rounded-full bg-[#bd7b4b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#a9663b]">Download PDF <ArrowDownToLine className="ml-2 h-4 w-4" /></a></article>)}</div>
        </div>
      </section>
      <FounderSection />
      <section className="bg-[#bd7b4b] py-20 text-white">
        <div className="container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="eyebrow text-white/75">
              Bring us your next opportunity
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl">
              Have capital, land, or a deal worth exploring?
            </h2>
          </div>
          <Link href="/partner">
            <Button className="rounded-full bg-[#173b46] px-6 py-6 text-white hover:bg-[#102d36]">
              Open a partnership dialogue{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
function ListingsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("");
  const [selectedState, setSelectedState] = useState<keyof typeof NIGERIA_LGAS | "">("");
  const [selectedLga, setSelectedLga] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [transactionType, setTransactionType] = useState<
    "all" | "buy" | "rent"
  >("all");
  const [submitted, setSubmitted] = useState({
    search: "",
    type: "all",
    status: "all",
    location: "",
    minPrice: 0,
    maxPrice: 0,
    transactionType: "all" as "all" | "buy" | "rent",
  });
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [locationFocused, setLocationFocused] = useState(false);
  const lgaOptions = selectedState ? NIGERIA_LGAS[selectedState] : [];
  const locationSuggestions = NIGERIA_LOCATION_OPTIONS.filter(
    option => !location || option.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 6);
  const applySearch = () => {
    setSubmitted({
      search,
      type,
      status,
      location: [selectedState, selectedLga, location].filter(Boolean).join(" "),
      minPrice,
      maxPrice,
      transactionType,
    });
    setPage(1);
  };
  const { data } = trpc.properties.list.useQuery(
    buildPropertySearchInput(submitted)
  );
  const filtered = (data?.length ? data : demoProperties).filter((p: any) =>
    matchesPropertyFilters(p, submitted)
  );
  const pageSize = 6;
  const properties = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div>
      <div className="relative bg-[#f1f0ea] pb-12 pt-28">
        <Header />
        <div className="container">
          <div className="eyebrow">The collection</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl text-[#173b46] md:text-6xl">
            Find the place that fits the thesis.
          </h1>
          <p className="mt-5 max-w-2xl text-[#6c7776]">
            Browse available and emerging opportunities, then use the numbers as
            a starting point for a deeper conversation.
          </p>
          <form onSubmit={event => { event.preventDefault(); applySearch(); }} className="mt-10 grid gap-3 rounded-2xl border border-[#deded5] bg-white p-3 md:grid-cols-[1.6fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#6c7776]" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search city, property, or state"
                className="border-0 bg-[#f8f7f3] pl-10"
              />
            </div>
            <select
              value={transactionType}
              onChange={e =>
                setTransactionType(e.target.value as "all" | "buy" | "rent")
              }
              className="h-10 rounded-md border-0 bg-[#f8f7f3] px-3 text-sm text-[#173b46]"
            >
              <option value="all">Rent or buy</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="h-10 rounded-md border-0 bg-[#f8f7f3] px-3 text-sm text-[#173b46]"
            >
              <option value="all">All property types</option>
              <option value="apartment">Apartment</option>
              <option value="duplex">Duplex</option>
              <option value="bungalow">Bungalow</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border-0 bg-[#f8f7f3] px-3 text-sm text-[#173b46]"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="under_offer">Under offer</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
              <select
                value={selectedState}
                onChange={e => {
                  const next = e.target.value as keyof typeof NIGERIA_LGAS | "";
                  setSelectedState(next);
                  setSelectedLga("");
                  setPage(1);
                }}
                className="h-10 rounded-md border-0 bg-[#f8f7f3] px-3 text-sm text-[#173b46]"
                aria-label="Filter by Nigerian state"
              >
                <option value="">All Nigerian states</option>
                {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
              <select
                value={selectedLga}
                onChange={e => { setSelectedLga(e.target.value); setPage(1); }}
                disabled={!selectedState}
                className="h-10 rounded-md border-0 bg-[#f8f7f3] px-3 text-sm text-[#173b46] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Filter by local government area"
              >
                <option value="">{selectedState ? "All LGAs in selected state" : "Select a state first"}</option>
                {lgaOptions.map(lga => <option key={lga} value={lga}>{lga}</option>)}
              </select>
            </div>
            <div className="relative md:col-span-2">
              <Input
                list="nigeria-location-options"
                value={location}
                onFocus={() => setLocationFocused(true)}
                onChange={e => {
                  setLocation(e.target.value);
                  setLocationFocused(true);
                }}
                placeholder="State, LGA, or street"
                className="border-0 bg-[#f8f7f3]"
              />
              <datalist id="nigeria-location-options">
                {NIGERIA_LOCATION_OPTIONS.map(option => {
                  const [state, lga, street] = option.split(" · ");
                  return (
                    <option
                      key={option}
                      value={state}
                      label={`${lga} · ${street}`}
                    />
                  );
                })}
              </datalist>
              {locationFocused && (
                <div className="absolute left-0 right-0 top-12 z-20 max-h-72 overflow-y-auto rounded-xl border border-[#deded5] bg-white p-2 shadow-xl">
                  <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#bd7b4b]">
                    Popular Nigerian locations
                  </div>
                  {locationSuggestions.map(option => {
                    const [state, lga, street] = option.split(" · ");
                    return (
                      <button
                        type="button"
                        key={option}
                        onMouseDown={event => {
                          event.preventDefault();
                          setSelectedState(state as keyof typeof NIGERIA_LGAS);
                          setSelectedLga(lga || "");
                          setLocation([state, lga].filter(Boolean).join(" "));
                          setLocationFocused(false);
                        }}
                        className="block w-full rounded-lg px-2 py-2 text-left text-xs text-[#173b46] hover:bg-[#f1f0ea]"
                      >
                        <span className="font-semibold">{state}</span>
                        {lga || street ? <span className="text-[#6c7776]">{" "}· {[lga, street].filter(Boolean).join(" · ")}</span> : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 rounded-lg bg-[#bd7b4b] px-6 text-white hover:bg-[#a9663b] md:col-span-4"
            >
              Search properties <Search className="ml-2 h-4 w-4" />
            </Button>
            <p className="md:col-span-4 px-1 text-xs text-[#6c7776]">
              Search by Nigerian state, local government area, neighborhood,
              street, or property name. Select a state and LGA for a focused search.
            </p>
          </form>
        </div>
      </div>
      <section className="py-12">
        <div className="container">
          <div className="mb-7 flex items-center justify-between">
            <p className="text-sm text-[#6c7776]">
              <span className="font-semibold text-[#173b46]">
                {filtered.length}
              </span>{" "}
              opportunities in view
            </p>
            <div className="flex gap-2 rounded-lg border border-[#deded5] bg-white p-1">
              <button
                onClick={() => setView("grid")}
                className={`rounded-md p-2 ${view === "grid" ? "bg-[#173b46] text-white" : "text-[#6c7776]"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-md p-2 ${view === "list" ? "bg-[#173b46] text-white" : "text-[#6c7776]"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            className={
              view === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "grid gap-4"
            }
          >
            {properties.length ? (
              properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full rounded-[1.4rem] border border-dashed border-[#deded5] bg-white p-8 text-center">
                <div className="font-display text-2xl text-[#173b46]">
                  No matching properties yet.
                </div>
                <p className="mt-3 text-sm leading-6 text-[#6c7776]">
                  Try a broader state or LGA, or
                  search by a neighborhood or street. You can also message the
                  developer directly on WhatsApp.
                </p>
                <a
                  href={buildDeveloperWhatsAppLink("a Nigerian property")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
                >
                  Ask the developer on WhatsApp{" "}
                  <MessageCircle className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full"
            >
              Previous
            </Button>
            <span className="text-sm text-[#6c7776]">
              Page {page} of{" "}
              {Math.max(1, Math.ceil(filtered.length / pageSize))}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(filtered.length / pageSize)}
              onClick={() => setPage(page + 1)}
              className="rounded-full"
            >
              Next
            </Button>
          </div>
          <div className="mt-14 overflow-hidden rounded-[1.5rem] bg-[#173b46]">
            <div className="grid lg:grid-cols-[.8fr_1.2fr]">
              <div className="p-8 text-white md:p-10">
                <div className="eyebrow text-[#d59462]">Explore by place</div>
                <h2 className="mt-4 font-display text-3xl">
                  See the opportunity in context.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/65">
                  Use the map to understand positioning, neighboring demand, and
                  the areas our team is watching.
                </p>
                <div className="mt-7 flex items-start gap-3 text-sm text-white/75">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#d59462]" /> Lagos &
                  Abuja opportunity corridors
                </div>
              </div>
              <MapView
                className="h-[360px]"
                initialCenter={{ lat: 6.4541, lng: 3.3947 }}
                initialZoom={10}
                onMapReady={map => {
                  properties.forEach((p: any) => {
                    const center = getPropertyMapCenter(p);
                    if (center)
                      new google.maps.marker.AdvancedMarkerElement({
                        map,
                        position: center,
                        title: `${p.title} · ${getPropertyLocationExactness(p) === "exact" ? "Exact location" : "Approximate area"}`,
                      });
                  });
                  const service = new google.maps.places.PlacesService(map);
                  ["school", "hospital", "shopping_mall"].forEach(type =>
                    service.nearbySearch(
                      {
                        location: { lat: 6.4541, lng: 3.3947 },
                        radius: 5000,
                        type,
                      },
                      (results, status) => {
                        if (
                          status === google.maps.places.PlacesServiceStatus.OK
                        )
                          results?.slice(0, 5).forEach(place => {
                            if (place.geometry?.location)
                              new google.maps.marker.AdvancedMarkerElement({
                                map,
                                position: place.geometry.location,
                                title: `${type}: ${place.name || "Nearby place"}`,
                              });
                          });
                      }
                    )
                  );
                }}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
function CalculatorPage() {
  const [price, setPrice] = useState(100000000);
  const [deposit, setDeposit] = useState(30);
  const [rate, setRate] = useState(15);
  const [rent, setRent] = useState(9000000);
  const [expenses, setExpenses] = useState(2200000);
  const loan = price * (1 - deposit / 100);
  const monthlyRate = rate / 100 / 12;
  const months = 20 * 12;
  const monthly = monthlyRate
    ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    : loan / months;
  const annualDebt = monthly * 12;
  const noi = rent - expenses;
  const cashInvested = price - loan;
  const cashOnCash = cashInvested
    ? ((noi - annualDebt) / cashInvested) * 100
    : 0;
  return (
    <div>
      <div className="relative bg-[#173b46] pb-20 pt-28 text-white">
        <Header dark />
        <div className="container">
          <div className="eyebrow">Decision tools</div>
          <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-6xl">
            Put a little structure around the upside.
          </h1>
          <p className="mt-5 max-w-2xl text-white/65">
            A directional calculator for early-stage thinking. For a complete
            underwriting model, speak with our team.
          </p>
        </div>
      </div>
      <main className="container grid gap-8 py-14 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[1.5rem] border border-[#deded5] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-[#bd7b4b]" />
            <h2 className="font-display text-2xl text-[#173b46]">
              Mortgage + ROI inputs
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#173b46]">
              Property price
              <input
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="h-11 rounded-lg border border-[#deded5] px-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#173b46]">
              Deposit %
              <input
                type="number"
                value={deposit}
                onChange={e => setDeposit(Number(e.target.value))}
                className="h-11 rounded-lg border border-[#deded5] px-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#173b46]">
              Annual interest %
              <input
                type="number"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="h-11 rounded-lg border border-[#deded5] px-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#173b46]">
              Annual rent
              <input
                type="number"
                value={rent}
                onChange={e => setRent(Number(e.target.value))}
                className="h-11 rounded-lg border border-[#deded5] px-3 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#173b46] md:col-span-2">
              Annual expenses
              <input
                type="number"
                value={expenses}
                onChange={e => setExpenses(Number(e.target.value))}
                className="h-11 rounded-lg border border-[#deded5] px-3 font-normal"
              />
            </label>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-[#ebe9e1] p-7">
          <div className="eyebrow">Illustrative output</div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-5">
              <div className="text-xs text-[#6c7776]">Monthly payment</div>
              <div className="mt-2 text-2xl font-bold text-[#173b46]">
                {fmt(monthly)}
              </div>
            </div>
            <div className="rounded-xl bg-white p-5">
              <div className="text-xs text-[#6c7776]">Loan amount</div>
              <div className="mt-2 text-2xl font-bold text-[#173b46]">
                {fmt(loan)}
              </div>
            </div>
            <div className="rounded-xl bg-white p-5">
              <div className="text-xs text-[#6c7776]">Net operating income</div>
              <div className="mt-2 text-2xl font-bold text-[#173b46]">
                {fmt(noi)}
              </div>
            </div>
            <div className="rounded-xl bg-[#173b46] p-5 text-white">
              <div className="text-xs text-white/60">Cash-on-cash return</div>
              <div className="mt-2 text-2xl font-bold text-[#d59462]">
                {cashOnCash.toFixed(1)}%
              </div>
            </div>
          </div>
          <p className="mt-7 text-xs leading-5 text-[#6c7776]">
            This calculator is for directional education only and does not
            constitute financial advice, an offer, or a guarantee of future
            returns.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
function InlineAnalyzer({ price }: { price: number }) {
  const [deposit, setDeposit] = useState(30);
  const [rent, setRent] = useState(Math.round(price * 0.08));
  const loan = price * (1 - deposit / 100);
  const rate = 0.15 / 12;
  const months = 240;
  const payment =
    (loan * rate * Math.pow(1 + rate, months)) /
    (Math.pow(1 + rate, months) - 1);
  const coc = ((rent - price * 0.02 - payment * 12) / (price - loan)) * 100;
  return (
    <div className="mt-10 rounded-[1.4rem] border border-[#deded5] bg-white p-7">
      <div className="eyebrow">Quick deal check</div>
      <h3 className="mt-3 font-display text-2xl text-[#173b46]">
        Pressure-test the opportunity.
      </h3>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-xs font-semibold text-[#173b46]">
          Deposit %
          <input
            type="number"
            value={deposit}
            onChange={e => setDeposit(Number(e.target.value))}
            className="mt-2 h-10 w-full rounded-lg border border-[#deded5] px-3 text-sm"
          />
        </label>
        <label className="text-xs font-semibold text-[#173b46]">
          Annual rent
          <input
            type="number"
            value={rent}
            onChange={e => setRent(Number(e.target.value))}
            className="mt-2 h-10 w-full rounded-lg border border-[#deded5] px-3 text-sm"
          />
        </label>
        <div className="rounded-lg bg-[#173b46] p-3 text-white">
          <div className="text-xs text-white/60">Est. cash-on-cash</div>
          <div className="mt-1 text-xl font-bold text-[#d59462]">
            {coc.toFixed(1)}%
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-[#6c7776]">
        Illustrative only. Adjust assumptions in the full analyzer.
      </p>
    </div>
  );
}
function PropertyPage() {
  const [, params] = useRoute("/property/:slug");
  const { data } = trpc.properties.bySlug.useQuery({
    slug: params?.slug || "",
  });
  const property =
    data ||
    demoProperties.find(p => p.slug === params?.slug) ||
    demoProperties[0];
  const locationCenter = getPropertyMapCenter(property);
  const locationExactness = getPropertyLocationExactness(property);
  const directionsUrl = buildGoogleMapsDirectionsUrl(property);
  const [sent, setSent] = useState(false);
  const mutation = trpc.leads.submitInquiry.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("Your inquiry is with the EdgePark team.");
    },
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I’d like to understand the opportunity in ${property.title}.`,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const submitInquiry = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (form.name.trim().length < 2) nextErrors.push("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.push("Enter a valid email address.");
    if (form.phone.trim() && form.phone.trim().replace(/\D/g, "").length < 7) nextErrors.push("Enter a valid phone number or leave it blank.");
    if (form.message.trim().length < 10) nextErrors.push("Tell us a little more about your request.");
    setErrors(nextErrors);
    if (nextErrors.length) return;
    mutation.mutate({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: form.message.trim(), propertyId: property.id, propertyTitle: property.title });
  };
  return (
    <div>
      <div className="bg-[#f1f0ea] pb-14 pt-28">
        <Header />
        <div className="container">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-[#6c7776]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to properties
          </Link>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="relative flex min-h-[460px] items-end overflow-hidden rounded-[1.6rem] bg-[#31525b] p-8 text-white">
              <FavoriteButton propertyId={property.id} />
              {dailyMedia(property.media)?.[0]?.url ? (
                <img
                  src={dailyMedia(property.media)[0].url}
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
              ) : null}
              <div className="hero-grid absolute inset-0 opacity-50" />
              <div className="relative">
                <Badge className="border-0 bg-[#bd7b4b] text-white">
                  {statusLabel(property.status)}
                </Badge>
                <h1 className="mt-5 max-w-2xl font-display text-4xl md:text-6xl">
                  {property.title}
                </h1>
                <div className="mt-4 flex items-center gap-2 text-white/70">
                  <MapPin className="h-4 w-4" />
                  {property.address || `${property.city}, ${property.state}`}
                </div>
              </div>
            </div>
            <div className="rounded-[1.6rem] bg-[#173b46] p-8 text-white">
              <div className="eyebrow text-[#d59462]">Investment snapshot</div>
              <div className="mt-5 text-4xl font-bold">
                {fmt(property.price)}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="border-t border-white/15 pt-3">
                  <div className="text-xs text-white/55">Projected ROI</div>
                  <div className="mt-1 text-2xl font-semibold text-[#d59462]">
                    {property.projectedRoi || "—"}%
                  </div>
                </div>
                <div className="border-t border-white/15 pt-3">
                  <div className="text-xs text-white/55">Projected yield</div>
                  <div className="mt-1 text-2xl font-semibold text-[#d59462]">
                    {property.projectedYield || "—"}%
                  </div>
                </div>
              </div>
              <Link
                href="/calculator"
                className="mt-10 flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm"
              >
                Run your own numbers <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void shareProperty(property)}
                  className="flex items-center justify-between rounded-xl bg-[#25D366] p-4 text-left text-sm font-semibold text-white"
                >
                  Share on WhatsApp <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void copyPropertyLink(property)}
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 p-4 text-left text-sm font-semibold text-white"
                >
                  Copy link <Link2 className="h-4 w-4" />
                </button>
              </div>
              {whatsappLink(
                property.agentWhatsapp || property.developerWhatsapp,
                property.title
              ) ? (
                <a
                  href={whatsappLink(
                    property.agentWhatsapp || property.developerWhatsapp,
                    property.title
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-semibold text-white"
                >
                  Ask about availability on WhatsApp{" "}
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-5">
        <PropertyGallery property={property} />
      </div>
      <section className="container mt-8 rounded-[1.5rem] border border-[#deded5] bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">Property location</div>
            <h2 className="mt-2 font-display text-2xl text-[#173b46]">
              View the location in context.
            </h2>
            <p className="mt-2 text-sm text-[#6c7776]">
              {property.address}, {property.city}, {property.state}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={
                locationExactness === "exact"
                  ? "bg-[#d9e4df] text-[#173b46]"
                  : "bg-[#f4dfce] text-[#8f5735]"
              }
            >
              {locationExactness === "exact"
                ? "Exact map location"
                : locationExactness === "approximate"
                  ? "Approximate area"
                  : "Location pending"}
            </Badge>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#173b46] px-4 py-2 text-xs font-semibold text-white"
              >
                Open in Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
        {locationCenter ? (
          <MapView
            className="mt-5 h-[320px] overflow-hidden rounded-xl"
            initialCenter={locationCenter}
            initialZoom={locationExactness === "exact" ? 16 : 11}
            onMapReady={map => {
              new google.maps.marker.AdvancedMarkerElement({
                map,
                position: locationCenter,
                title: property.title,
              });
            }}
          />
        ) : (
          <div className="mt-5 rounded-xl bg-[#f8f7f3] p-6 text-sm leading-6 text-[#6c7776]">
            The exact map point is not available yet. This listing is shown by
            its stated city and state only; contact EdgePark for the verified
            location before arranging a viewing.
          </div>
        )}
        {locationCenter ? (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#f8f7f3] p-4 text-xs text-[#6c7776] sm:flex-row sm:items-center sm:justify-between">
            <span>
              {locationExactness === "exact"
                ? "Stored coordinates"
                : "City-area map reference; verify the exact point before viewing"}
              : {locationCenter.lat.toFixed(6)}, {locationCenter.lng.toFixed(6)}
            </span>
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#bd7b4b] hover:underline"
              >
                Get directions / verify location
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
      <main className="container grid gap-8 py-14 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#ebe9e1] p-4">
              <BedDouble className="h-5 w-5 text-[#bd7b4b]" />
              <div className="mt-4 text-xl font-bold text-[#173b46]">
                {property.bedrooms || "—"}
              </div>
              <div className="text-xs text-[#6c7776]">Bedrooms</div>
            </div>
            <div className="rounded-xl bg-[#ebe9e1] p-4">
              <Bath className="h-5 w-5 text-[#bd7b4b]" />
              <div className="mt-4 text-xl font-bold text-[#173b46]">
                {property.bathrooms || "—"}
              </div>
              <div className="text-xs text-[#6c7776]">Bathrooms</div>
            </div>
            <div className="rounded-xl bg-[#ebe9e1] p-4">
              <HomeIcon className="h-5 w-5 text-[#bd7b4b]" />
              <div className="mt-4 text-xl font-bold text-[#173b46]">
                {property.areaSqm || "—"}
              </div>
              <div className="text-xs text-[#6c7776]">m²</div>
            </div>
          </div>
          <div className="mt-10">
            <div className="eyebrow">The opportunity</div>
            <h2 className="mt-3 font-display text-3xl text-[#173b46]">
              A clearer way to evaluate the place behind the price.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#6c7776]">
              {property.description}
            </p>
          </div>
          <div className="mt-10 rounded-[1.4rem] bg-[#ebe9e1] p-7">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-[#bd7b4b]" />
              <h3 className="font-display text-2xl text-[#173b46]">
                Why investors are looking here
              </h3>
            </div>
            <div className="mt-5 grid gap-4 text-sm text-[#6c7776] md:grid-cols-3">
              <div className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#bd7b4b]" />
                Demand-led location
              </div>
              <div className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#bd7b4b]" />
                Clear use case
              </div>
              <div className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#bd7b4b]" />
                Team-led diligence
              </div>
            </div>
          </div>
          <InlineAnalyzer price={Number(property.price)} />
        </div>
        <div className="rounded-[1.5rem] border border-[#deded5] bg-white p-7 shadow-sm">
          <div className="eyebrow">Request the brief</div>
          <h3 className="mt-3 font-display text-3xl text-[#173b46]">
            Let’s talk through this property.
          </h3>
          {sent ? (
            <div className="mt-8 rounded-xl bg-[#d9e4df] p-5 text-sm leading-6 text-[#173b46]">
              Thanks — your request is in. We’ll follow up with the property
              brief and next steps.
            </div>
          ) : (
            <form onSubmit={submitInquiry} noValidate className="mt-7 grid gap-4">
              <Input
                required
                placeholder="Your name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                required
                type="email"
                placeholder="Email address *"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <Textarea
                required
                minLength={10}
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
              />
              {errors.length > 0 && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><div className="font-semibold">Please correct the following:</div><ul className="mt-2 list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
              <Button type="submit" disabled={mutation.isPending} className="rounded-full bg-[#173b46] py-6 text-white">
                {mutation.isPending ? "Sending…" : "Send inquiry"}
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-[#6c7776]">
                No pressure. Just a thoughtful first conversation.
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
const roles = [
  {
    id: "investor",
    title: "Investors",
    desc: "Access better-sourced opportunities and a team that can help you move from interest to conviction.",
    icon: CircleDollarSign,
  },
  {
    id: "owner",
    title: "Property owners",
    desc: "Bring an asset to a partner that understands positioning, presentation, and the right buyer conversation.",
    icon: HomeIcon,
  },
  {
    id: "agent",
    title: "Agents",
    desc: "Extend your reach with a responsive team for qualified opportunities and serious conversations.",
    icon: Users,
  },
  {
    id: "developer",
    title: "Developers",
    desc: "Explore capital, distribution, and strategic partnership around projects with a clear point of view.",
    icon: Building2,
  },
  {
    id: "realtor",
    title: "Licensed realtors",
    desc: "Collaborate on well-presented opportunities with a professional, relationship-led process.",
    icon: ShieldCheck,
  },
];
function PartnerPage() {
  const [role, setRole] = useState("investor");
  const mutation = trpc.leads.submitPartnership.useMutation({ onSuccess: () => toast.success("Application received. We’ll be in touch soon.") });
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", investmentRange: "", message: "", location: "", assetType: "", budget: "", timeline: "", fundingStatus: "", experience: "", proposalLink: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const roleDetails: Record<string, { title: string; fields: string[]; prompt: string }> = {
    investor: { title: "Investor", fields: ["investmentRange", "fundingStatus", "timeline"], prompt: "Tell us about your investment goals, preferred asset class, and timeline." },
    owner: { title: "Property owner", fields: ["location", "assetType", "budget"], prompt: "Tell us about the property, ownership position, location, and what you need." },
    agent: { title: "Agent", fields: ["company", "location", "assetType"], prompt: "Tell us about your market, inventory, and the type of collaboration you want." },
    developer: { title: "Developer", fields: ["location", "assetType", "budget", "timeline"], prompt: "Tell us about the development, site, stage, capital need, and delivery timeline." },
    realtor: { title: "Realtor", fields: ["company", "location", "experience"], prompt: "Tell us about your market coverage, clients, and the opportunities you represent." },
  };
  const detailLabels: Record<string, string> = { location: "Property/project location", assetType: "Asset type", budget: "Budget or project scale", timeline: "Timeline", fundingStatus: "Funding status", experience: "Market experience", proposalLink: "Proposal or pitch-deck link" };
  const setField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const required = ["name", "email", "phone", "message", ...roleDetails[role].fields];
    const missing = required.filter(key => !String((form as any)[key] || "").trim());
    if (missing.length) { setErrors(missing.map(key => `${detailLabels[key] || key[0].toUpperCase() + key.slice(1)} is required.`)); return; }
    setErrors([]);
    const details = Object.entries(detailLabels).filter(([key]) => String((form as any)[key] || "").trim()).map(([key, label]) => `${label}: ${(form as any)[key]}`).join("\\n");
    mutation.mutate(buildPartnershipLeadPayload({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), company: form.company.trim(), investmentRange: form.investmentRange.trim(), message: `${form.message.trim()}\\n\\n${details}` }, role as any));
  };
  const whatsapp = `https://wa.me/2348141997159?text=${encodeURIComponent(`Hello EdgePark Estate, I need help with a ${roleDetails[role].title} partnership application.`)}`;
  return <div><div className="bg-[#173b46] pb-20 pt-28 text-white"><Header dark /><div className="container"><div className="eyebrow text-[#d59462]">Partnerships, thoughtfully structured</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight md:text-7xl">The best opportunities are built together.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Choose the path that describes you. Each application captures the information our team needs to respond with a useful next step.</p></div></div><main className="container py-16"><div className="grid gap-4 md:grid-cols-5">{roles.map(({ id, title, desc, icon: Icon }) => <button type="button" key={id} onClick={() => { setRole(id); setErrors([]); }} className={`rounded-[1.2rem] p-5 text-left ${role === id ? "bg-[#bd7b4b] text-white" : "bg-[#ebe9e1] text-[#173b46]"}`}><Icon className="h-6 w-6" /><div className="mt-8 font-display text-xl">{title}</div><p className={`mt-3 text-xs leading-5 ${role === id ? "text-white/75" : "text-[#6c7776]"}`}>{desc}</p></button>)}</div><div className="mt-12 grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><div className="eyebrow">{roleDetails[role].title} pathway</div><h2 className="mt-4 font-display text-4xl text-[#173b46]">A different brief for a better conversation.</h2><p className="mt-5 text-base leading-8 text-[#6c7776]">{roleDetails[role].prompt} We keep your application in the admin partnership inbox for a considered follow-up.</p><a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center rounded-full border border-[#173b46]/20 px-5 py-3 text-sm font-semibold text-[#173b46]">Need help? Continue on WhatsApp <ArrowRight className="ml-2 h-4 w-4" /></a></div><form onSubmit={submit} noValidate className="rounded-[1.5rem] border border-[#deded5] bg-white p-7 shadow-sm"><div className="eyebrow">{roleDetails[role].title} application</div><div className="mt-6 grid gap-4"><Input required aria-label="Full name" placeholder="Full name *" value={form.name} onChange={e => setField("name", e.target.value)} /><Input required type="email" aria-label="Email address" placeholder="Email address *" value={form.email} onChange={e => setField("email", e.target.value)} /><Input required aria-label="Phone" placeholder="Phone / WhatsApp *" value={form.phone} onChange={e => setField("phone", e.target.value)} /><Input placeholder="Company / organization" value={form.company} onChange={e => setField("company", e.target.value)} />{roleDetails[role].fields.map(key => <Input key={key} required placeholder={`${detailLabels[key]} *`} value={(form as any)[key]} onChange={e => setField(key, e.target.value)} />)}<Input placeholder="Proposal or pitch-deck link (optional)" value={form.proposalLink} onChange={e => setField("proposalLink", e.target.value)} /><Textarea required rows={6} placeholder="Describe the opportunity or request *" value={form.message} onChange={e => setField("message", e.target.value)} />{errors.length > 0 && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><div className="font-semibold">Please complete the following:</div><ul className="mt-2 list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}<Button type="submit" disabled={mutation.isPending} className="rounded-full bg-[#173b46] py-6 text-white">{mutation.isPending ? "Submitting…" : "Submit partnership application"}<ArrowRight className="ml-2 h-4 w-4" /></Button><a href={whatsapp} target="_blank" rel="noreferrer" className="text-center text-sm font-semibold text-[#bd7b4b]">Prefer to send details on WhatsApp?</a></div></form></div></main><Footer /></div>;
}
function InternationalProspectingPanel() {
  const [query, setQuery] = useState("real estate");
  const [region, setRegion] = useState<"Europe" | "Asia" | "Americas" | "Africa">("Europe");
  const [countryCode, setCountryCode] = useState("GB");
  const [category, setCategory] = useState("real estate developer");
  const [results, setResults] = useState<any[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const search = trpc.international.search.useQuery({ query, countryCode, category }, { enabled: false });
  const { data: saved = [], refetch: refetchSaved } = trpc.international.saved.useQuery();
  const save = trpc.international.save.useMutation({ onSuccess: () => { refetchSaved(); toast.success("Prospect saved to pipeline"); } });
  const update = trpc.international.update.useMutation({ onSuccess: () => { refetchSaved(); toast.success("Prospect updated"); } });
  const enrich = trpc.international.enrichWebsite.useMutation();
  const discover = trpc.international.discoverContacts.useMutation();
  const sendEmail = trpc.international.sendEmail.useMutation();
  const generateDraft = trpc.international.generateDraft.useMutation();
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [contactProfile, setContactProfile] = useState<any | null>(null);
  const [objective, setObjective] = useState("strategic partnership");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [offer, setOffer] = useState("We can bring qualified customers, market insight, and a trusted Nigeria-based real estate partnership channel while helping your business reach a wider audience.");
  const [partnerOps, setPartnerOps] = useState<Record<string, any>>({});
  useEffect(() => { try { const stored = window.localStorage.getItem("edgepark-partner-ops"); if (stored) setPartnerOps(JSON.parse(stored)); } catch { /* Ignore unavailable browser storage. */ } }, []);
  useEffect(() => { try { window.localStorage.setItem("edgepark-partner-ops", JSON.stringify(partnerOps)); } catch { /* Continue without local persistence. */ } }, [partnerOps]);
  const defaultOps = (business: any) => ({ stage: "New", score: business?.phone || business?.email ? 55 : 30, verification: business?.phone || business?.email ? "Directory listed" : "Needs verification", nextFollowUp: "", lastContacted: "", notes: "", activities: [] as Array<{ date: string; type: string; note: string }> });
  const opsFor = (business: any) => ({ ...defaultOps(business), ...(partnerOps[business?.placeId] || {}) });
  const updateOps = (business: any, patch: any) => { if (!business?.placeId) return; setPartnerOps(current => ({ ...current, [business.placeId]: { ...opsFor(business), ...patch } })); };
  const addActivity = (business: any, type: string, note: string) => { const current = opsFor(business); updateOps(business, { activities: [...(current.activities || []), { date: new Date().toISOString(), type, note }], lastContacted: type === "Email sent" || type === "Phone call" || type === "Meeting" ? new Date().toISOString().slice(0, 10) : current.lastContacted }); };
  const [draft, setDraft] = useState<any | null>(null);
  const regions = ["Europe", "Asia", "Americas", "Africa"] as const;
  const grouped = regions.map(region => ({ region, markets: INTERNATIONAL_MARKETS.filter(market => market.region === region) }));
  const visibleMarkets = INTERNATIONAL_MARKETS.filter(market => market.region === region);
  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) { setSearchMessage("Enter at least two characters, such as property developers or housing funds."); return; }
    setSearchMessage("");
    try {
      const response = await search.refetch();
      let nextResults = response.data || [];
      // The browser fallback bypasses a stale Hostinger backend or a provider
      // that returns an empty array. It uses public, CORS-readable directories
      // and never fabricates contact details.
      if (!nextResults.length) {
        const market = INTERNATIONAL_MARKETS.find(item => item.code === countryCode);
        const country = market?.name || countryCode;
        const text = `${category} ${query.trim()}, ${country}`;
        try {
          const osmResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&q=${encodeURIComponent(text)}`, { headers: { Accept: "application/json" } });
          const osmPlaces = osmResponse.ok ? await osmResponse.json() : [];
          nextResults = (osmPlaces || []).map((place: any) => ({ placeId: `browser-osm-${place.osm_type}-${place.osm_id}`, name: place.name || String(place.display_name).split(",")[0], address: place.display_name, website: undefined, phone: undefined, mapsUrl: `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`, types: [place.type || category], category, source: "OpenStreetMap", region, countryCode }));
        } catch { /* try Wikipedia below */ }
        if (!nextResults.length) {
          try {
            const wikiResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=8&format=json&origin=*&srsearch=${encodeURIComponent(text)}`);
            const wikiPayload = wikiResponse.ok ? await wikiResponse.json() : {};
            nextResults = (wikiPayload?.query?.search || []).map((item: any) => ({ placeId: `browser-wiki-${item.pageid}`, name: item.title, address: country, website: `https://www.google.com/search?q=${encodeURIComponent(`${item.title} ${country}`)}`, phone: undefined, mapsUrl: `https://en.wikipedia.org/?curid=${item.pageid}`, types: [category], category, source: "Wikipedia public research", region, countryCode }));
          } catch { /* final message below */ }
        }
        if (nextResults.length) setSearchMessage("Public research results returned. Verify the company website and contact person before outreach.");
      }
      setResults(nextResults);
      if (nextResults.length) {
        // Open the first prospect automatically so the AI workspace is visible
        // immediately after Search businesses succeeds.
        selectBusiness(nextResults[0]);
      } else setSearchMessage("No public business records were found for this exact phrase. Try a broader term such as company, property, agency, or business.");
    } catch (error: any) {
      setResults([]);
      setSearchMessage(error?.message || "Search is unavailable. Try again with a broader term.");
    }
  };
  const discoverContacts = async (business: any) => { try { const profile = await discover.mutateAsync({ businessName: business.name || "International business", country: business.address, category: business.category || business.types?.join(", ") }); setContactProfile((current: any) => ({ ...(current || {}), ...profile })); if (profile.email) setRecipientEmail(profile.email); setSearchMessage(profile.email || profile.phone ? "Public contact details found. Verify the source before outreach." : "No public phone or email was found for this result. Open the source pages and verify the organization manually."); } catch (error: any) { setSearchMessage(error?.message || "Public contact discovery was unavailable. Verify the company website manually."); } };
  const selectBusiness = (business: any) => { setSelectedBusiness(business); setDraft(null); const hasContact = Boolean(business.phone || business.email || business.website || business.contactName || business.contactRole); setContactProfile(hasContact ? { contactName: business.contactName || null, contactRole: business.contactRole || "Business Development / Partnerships team", email: business.email || null, phone: business.phone || null, website: validHttpUrl(business.website), sourceUrl: validHttpUrl(business.website) || validHttpUrl(business.mapsUrl), publicSummary: null } : null); void discoverContacts(business); };
  const validHttpUrl = (value: unknown) => { if (typeof value !== "string" || !value.trim()) return undefined; try { const url = new URL(value.trim(), window.location.origin); if (!["http:", "https:"].includes(url.protocol)) return undefined; return url.toString(); } catch { return undefined; } };
  const generateOutreach = async () => {
    if (!selectedBusiness) return;
    setSearchMessage("");
    try {
      let profile = contactProfile;
      const website = validHttpUrl(selectedBusiness.website);
      if (website && !website.includes("google.com/search") && !website.includes("wikipedia.org/") && !profile?.publicSummary) { try { const enriched = await enrich.mutateAsync({ website }); profile = { ...(profile || {}), ...enriched }; setContactProfile(profile); } catch { /* Keep directory contact fields when enrichment is unavailable. */ } }
      const result = await generateDraft.mutateAsync({ businessName: selectedBusiness.name || "International business", address: selectedBusiness.address, website, phone: selectedBusiness.phone, contactName: profile?.contactName || undefined, contactRole: profile?.contactRole || "Business Development / Partnerships team", websiteSummary: profile?.publicSummary || undefined, sector: selectedBusiness.types?.join(", "), objective: objective as any, offer, tone: "professional" });
      setDraft(result);
      setRecipientEmail(profile?.email || "");
    } catch (error: any) {
      // Keep the button useful even when an upstream AI request is blocked by
      // Hostinger configuration or a malformed provider URL. This draft is
      // generated from the selected result only and is clearly marked for fact
      // checking; no contact details or company claims are invented.
      setDraft({ subject: `Partnership conversation with ${selectedBusiness.name || "this business"}`, greeting: `Hello ${selectedBusiness.name || "partnerships team"} team,`, body: `EdgePark Estate is exploring a practical ${objective} collaboration with ${selectedBusiness.name || "your organisation"}. We would welcome a short conversation to understand your priorities and identify a focused way to create mutual value across Nigeria and ${selectedBusiness.address || "your market"}.`, callToAction: "Would you be open to a 20-minute introductory conversation next week?", companySummary: `${selectedBusiness.name || "This business"} is a public research result in ${selectedBusiness.address || "the selected market"}. Verify its official website and current activities before outreach.`, recommendedContact: "Business Development / Partnerships team", whyThisFit: `Potential fit around ${objective}, customer access, market visibility, or complementary property services.`, proposalAngle: offer, talkingPoints: ["Confirm current priorities and target customers.", "Ask how the company currently acquires partners and leads.", "Present EdgePark’s Nigeria-based customer and partnership channel.", "Propose one small measurable pilot before a larger commitment."], objectionsAndResponses: [{ objection: "Send more information first.", response: "Share the short proposal, pilot scope, responsibilities, and a clear meeting request." }], nextStep: "Verify the official website and identify the appropriate partnerships contact.", dealAnalysis: "Start with a low-risk pilot. Agree responsibilities, lead attribution, costs, timeline, and a review date before expanding.", revenuePaths: ["Referral fee agreed in writing", "Qualified-lead partnership", "Listing or visibility service", "Revenue share tied to completed transactions"], risksAndChecks: ["Verify company identity and contact channel.", "Confirm decision-making authority.", "Document lead ownership, payment triggers, privacy, and termination terms."], closePlan: ["Confirm the prospect’s goal and decision process.", "Offer one specific pilot.", "Agree owners, deliverables, metrics, and next meeting.", "Send a written recap and simple terms.", "Measure the pilot and propose the next phase."], successMetrics: ["Qualified introductions", "Meetings booked", "Customers or listings converted", "Time to first measurable result"], factCheckNote: `Fallback proposal prepared because the AI service returned an error: ${error?.message || "unknown error"}. Verify all company information before sending.` });
      setSearchMessage("Proposal prepared in safe fallback mode. Verify the public company details before sending.");
    }
  };
  const draftMailto = draft && selectedBusiness ? `mailto:${recipientEmail || ""}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(`${draft.greeting}\\n\\n${draft.body}\\n\\n${draft.callToAction}\\n\\nBest regards,\\nEdgePark Estate`)}` : "#";
  const sendGeneratedEmail = async () => {
    if (!draft || !selectedBusiness) return;
    try { await sendEmail.mutateAsync({ to: recipientEmail, companyName: selectedBusiness.name, subject: draft.subject, greeting: draft.greeting, body: draft.body, callToAction: draft.callToAction, proposalAngle: draft.proposalAngle }); setSearchMessage(`Email sent successfully to ${recipientEmail}.`); }
    catch (error: any) { setSearchMessage(error?.message || "Email could not be sent. Check the SMTP settings in Hostinger."); }
  };
  const pitchLink = (business: any) => {
    const subject = `International partnership proposal — EdgePark Estate & ${business.name}`;
    const body = `Hello ${business.name} team,\\n\\nI am reaching out from EdgePark Estate in Nigeria. We are exploring a strong international partnership around real estate development, property management, housing opportunities, and digital visibility.\\n\\nI would welcome a short conversation about how we could create growth together in ${business.address || "your market"}.\\n\\nKind regards,\\nEdgePark Estate`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <section className="mt-8 rounded-[1.4rem] border border-[#173b46]/15 bg-[#173b46] p-6 text-white shadow-sm md:p-8">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><div className="eyebrow text-[#d59462]">International partnerships</div><h2 className="mt-2 font-display text-3xl">Find your next strategic partner.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">Search public business listings across Europe, Asia, the Americas, and Africa. Contact details are shown live from Google Maps and are not stored in the EdgePark database.</p></div>
      <Badge className="w-fit bg-[#d59462] text-white">Admin only · 4 regions</Badge>
    </div>
    <form onSubmit={runSearch} className="mt-6 grid gap-3 rounded-2xl bg-white/10 p-4 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
      <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search any business, service, or opportunity" className="border-white/20 bg-white text-[#173b46]" aria-label="Business search" />
      <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 rounded-md border border-white/20 bg-white px-3 text-sm text-[#173b46]" aria-label="Business category">
        <option value="real estate developer">Real estate developer</option><option value="real estate agency">Real estate agency</option><option value="real estate broker">Real estate broker</option><option value="realtor">Realtor</option><option value="property management company">Property management</option><option value="portfolio management company">Portfolio management</option><option value="real estate investment company">Real estate investment</option><option value="housing fund">Housing fund</option><option value="commercial property company">Commercial property</option><option value="construction company">Construction company</option><option value="solar energy company">Solar and energy</option><option value="mortgage finance company">Mortgage and finance</option><option value="estate business deal">Estate business deal</option><option value="proptech company">PropTech</option><option value="business partnership">Other partnership target</option>
      </select>
      <select value={region} onChange={e => { const next = e.target.value as typeof region; setRegion(next); const first = INTERNATIONAL_MARKETS.find(market => market.region === next); if (first) setCountryCode(first.code); }} className="h-10 rounded-md border border-white/20 bg-white px-3 text-sm text-[#173b46]" aria-label="Continent or region">
        {regions.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
      <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="h-10 rounded-md border border-white/20 bg-white px-3 text-sm text-[#173b46]" aria-label="International country">
        {visibleMarkets.map(market => <option key={market.code} value={market.code}>{market.name}</option>)}
      </select>
      <Button type="submit" disabled={search.isFetching} className="rounded-full bg-[#d59462] text-white hover:bg-[#bd7b4b]">{search.isFetching ? "Searching…" : "Search businesses"}<Search className="ml-2 h-4 w-4" /></Button>
    </form>
    {selectedBusiness && <div className="mt-6 grid gap-6 rounded-2xl bg-white p-5 text-[#173b46] lg:grid-cols-[.85fr_1.15fr]"><div><div className="eyebrow">Contact intelligence</div><h3 className="mt-2 font-display text-2xl">{selectedBusiness.name}</h3><p className="mt-2 text-sm leading-6 text-[#6c7776]">Use only publicly listed business contact information. The system never invents a person or contact channel.</p><div className="mt-4 grid gap-2 text-sm"><div><span className="font-semibold">Best route:</span> {contactProfile?.contactRole || "Business Development / Partnerships team"}</div><div><span className="font-semibold">Person:</span> {contactProfile?.contactName || "Not publicly listed"}</div><div><span className="font-semibold">Email:</span> {contactProfile?.email || "Not publicly listed"}</div><div><span className="font-semibold">Phone:</span> {contactProfile?.phone || selectedBusiness.phone || "Not publicly listed"}</div><div><span className="font-semibold">Booking link:</span> {contactProfile?.bookingUrl ? <a className="text-[#bd7b4b] underline" href={contactProfile.bookingUrl} target="_blank" rel="noreferrer">Open booking page</a> : "Not publicly listed"}</div>{contactProfile?.sourceUrl && <a className="text-xs text-[#bd7b4b] underline" href={contactProfile.sourceUrl} target="_blank" rel="noreferrer">Verify source page</a>}<Button type="button" size="sm" onClick={() => discoverContacts(selectedBusiness)} disabled={discover.isPending} className="mt-2 w-fit rounded-full bg-[#e8efe9] text-[#173b46]">{discover.isPending ? "Finding public contacts…" : "Find public contacts again"}</Button></div><p className="mt-4 text-[11px] text-[#8a918e]">{contactProfile ? "Enrichment completed from the business website." : selectedBusiness.website ? "Click Generate AI outreach to inspect the public website for published contact routes." : "No official website was returned, so use the listed phone or Google Maps profile."}</p></div><div><div className="eyebrow">AI outreach generator</div><div className="mt-3 grid gap-3"><select value={objective} onChange={e => setObjective(e.target.value)} className="h-10 rounded-md border border-[#deded5] px-3 text-sm"><option>strategic partnership</option><option>bring customers</option><option>list the business online</option><option>real estate development</option><option>property management</option><option>solar and energy partnership</option><option>other</option></select><Textarea value={offer} onChange={e => setOffer(e.target.value)} rows={4} placeholder="What EdgePark can offer" /><Button type="button" onClick={generateOutreach} disabled={generateDraft.isPending || enrich.isPending} className="rounded-full bg-[#bd7b4b] text-white">{generateDraft.isPending || enrich.isPending ? "Researching and writing…" : "Generate AI email and proposal"}<Sparkles className="ml-2 h-4 w-4" /></Button>{draft && <div className="rounded-xl border border-[#deded5] bg-[#f8f7f3] p-4"><div className="font-semibold">{draft.subject}</div><p className="mt-3 whitespace-pre-line text-sm leading-6">{draft.greeting}{"\\n\\n"}{draft.body}{"\\n\\n"}{draft.callToAction}</p><div className="mt-4 grid gap-3 border-t border-[#deded5] pt-4 text-sm"><div><strong>Company summary:</strong> {draft.companySummary}</div><div><strong>Recommended contact:</strong> {draft.recommendedContact}</div><div><strong>Why this may fit:</strong> {draft.whyThisFit}</div><div><strong>Proposal angle:</strong> {draft.proposalAngle}</div><div><strong>Next step:</strong> {draft.nextStep}</div><div className="rounded-lg bg-white p-3"><strong>Deal analysis:</strong><p className="mt-1 text-[#6c7776]">{draft.dealAnalysis}</p><strong className="mt-3 block">Revenue paths:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{(draft.revenuePaths || []).map((item: string, index: number) => <li key={index}>{item}</li>)}</ul></div><div><strong>Conversation talking points:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{(draft.talkingPoints || []).map((point: string, index: number) => <li key={index}>{point}</li>)}</ul></div>{draft.objectionsAndResponses?.length ? <div><strong>Likely objections and responses:</strong><div className="mt-2 grid gap-2">{draft.objectionsAndResponses.map((item: any, index: number) => <div key={index} className="rounded-lg bg-white p-3"><div className="font-semibold">“{item.objection}”</div><div className="mt-1 text-[#6c7776]">{item.response}</div></div>)}</div></div> : null}<div className="rounded-lg bg-[#e8efe9] p-3"><strong>Deal-closing plan:</strong><ol className="mt-2 list-decimal space-y-1 pl-5">{(draft.closePlan || []).map((step: string, index: number) => <li key={index}>{step}</li>)}</ol><strong className="mt-3 block">Risks and checks:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{(draft.risksAndChecks || []).map((item: string, index: number) => <li key={index}>{item}</li>)}</ul><strong className="mt-3 block">Success metrics:</strong><ul className="mt-1 list-disc space-y-1 pl-5">{(draft.successMetrics || []).map((item: string, index: number) => <li key={index}>{item}</li>)}</ul></div><div className="text-xs text-[#6c7776]"><strong>Fact check:</strong> {draft.factCheckNote}</div></div><div className="mt-4 grid gap-3 border-t border-[#deded5] pt-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c7776]">Send branded HTML email</div><Input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="Recipient email address" aria-label="Recipient email address" /><div className="flex flex-wrap gap-2"><Button type="button" disabled={sendEmail.isPending || !recipientEmail} onClick={sendGeneratedEmail} className="inline-flex h-9 items-center rounded-full bg-[#173b46] px-3 text-xs font-semibold text-white">{sendEmail.isPending ? "Sending…" : "Send EdgePark email"}<Mail className="ml-2 h-3.5 w-3.5" /></Button><a href={draftMailto} className="inline-flex h-9 items-center rounded-full border border-[#173b46]/15 px-3 text-xs font-semibold">Open editable email <Mail className="ml-2 h-3.5 w-3.5" /></a></div>{contactProfile?.bookingUrl && <a href={contactProfile.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full border border-[#173b46]/15 px-3 text-xs font-semibold">Book a meeting <CalendarDays className="ml-2 h-3.5 w-3.5" /></a>}</div></div>}</div></div></div>}
    {searchMessage && <div className="mt-4 rounded-xl bg-[#f4dfce] p-4 text-sm text-[#7d4b2d]">{searchMessage}</div>}
    {results.length > 0 && <div className="mt-6"><div className="flex items-center justify-between"><h3 className="font-display text-xl">Live results</h3><span className="text-xs text-white/55">{results.length} prospects · Google Maps data</span></div><div className="mt-3 grid gap-3 lg:grid-cols-2">{results.map(business => <article key={business.placeId} className="rounded-2xl bg-white p-5 text-[#173b46]"><div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold">{business.name}</h4><p className="mt-1 text-xs leading-5 text-[#6c7776]">{business.address || "Address unavailable"}</p></div><Badge className="bg-[#d9e4df] text-[#173b46]">{business.countryCode}</Badge></div><div className="mt-4 grid gap-2 text-sm">{business.phone ? <a href={`tel:${business.phone}`} className="font-semibold text-[#bd7b4b]">{business.phone}</a> : <span className="text-[#8a918e]">Phone not listed</span>}{business.email ? <a href={`mailto:${business.email}`} className="truncate text-[#bd7b4b]">{business.email}</a> : <span className="text-[#8a918e]">Email not listed</span>}{validHttpUrl(business.website) ? <a href={validHttpUrl(business.website)} target="_blank" rel="noreferrer" className="truncate text-[#173b46] underline">{business.website}</a> : <span className="text-[#8a918e]">Website not listed</span>}</div><div className="mt-4 flex flex-wrap gap-2"><Button type="button" size="sm" onClick={() => { selectBusiness(business); save.mutate({ placeId: business.placeId, region: business.region, countryCode: business.countryCode }); }} className="rounded-full bg-[#173b46] text-white">Contact info & AI pitch</Button><a href={pitchLink(business)} className="inline-flex h-9 items-center rounded-full border border-[#173b46]/15 px-3 text-xs font-semibold">Prepare email <Mail className="ml-2 h-3.5 w-3.5" /></a>{validHttpUrl(business.mapsUrl) && <a href={validHttpUrl(business.mapsUrl)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full border border-[#173b46]/15 px-3 text-xs font-semibold">Google Maps <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></a>}</div></article>)}</div><p className="mt-3 text-[11px] text-white/45">Google Maps attribution: business information is provided by Google Maps. Verify details before outreach and follow applicable privacy, marketing, and platform policies.</p></div>}
    <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5"><div className="eyebrow text-white/60">Partner command centre</div><h3 className="mt-2 font-display text-2xl">Turn prospects into collaborations.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Qualify the right partner, verify the public contact route, schedule the next action, and keep a complete relationship record.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["New", "Qualified", "Meeting", "Won"].map(stage => <div key={stage} className="rounded-xl bg-white/10 p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/50">{stage}</div><div className="mt-1 text-2xl font-semibold">{Object.values(partnerOps).filter((item: any) => item.stage === stage).length}</div></div>)}</div>{selectedBusiness && <div className="mt-5 rounded-xl bg-white p-4 text-[#173b46]"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="eyebrow">Partner profile</div><h4 className="mt-1 font-display text-xl">{selectedBusiness.name}</h4><p className="text-xs text-[#6c7776]">{selectedBusiness.address || selectedBusiness.countryCode || "Selected market"}</p></div><div className="rounded-full bg-[#e8efe9] px-3 py-1 text-xs font-semibold">{opsFor(selectedBusiness).score}/100 fit score</div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="grid gap-1 text-xs font-semibold">Pipeline stage<select value={opsFor(selectedBusiness).stage} onChange={e => updateOps(selectedBusiness, { stage: e.target.value })} className="h-9 rounded-md border border-[#deded5] px-2 font-normal"><option>New</option><option>Qualified</option><option>Contacted</option><option>Meeting</option><option>Proposal</option><option>Negotiation</option><option>Won</option><option>Nurture</option></select></label><label className="grid gap-1 text-xs font-semibold">Fit score<input type="number" min="0" max="100" value={opsFor(selectedBusiness).score} onChange={e => updateOps(selectedBusiness, { score: Math.max(0, Math.min(100, Number(e.target.value))) })} className="h-9 rounded-md border border-[#deded5] px-2 font-normal" /></label><label className="grid gap-1 text-xs font-semibold">Contact confidence<select value={opsFor(selectedBusiness).verification} onChange={e => updateOps(selectedBusiness, { verification: e.target.value })} className="h-9 rounded-md border border-[#deded5] px-2 font-normal"><option>Verified public</option><option>Directory listed</option><option>Needs verification</option><option>Not available</option></select></label><label className="grid gap-1 text-xs font-semibold">Next follow-up<input type="date" value={opsFor(selectedBusiness).nextFollowUp} onChange={e => updateOps(selectedBusiness, { nextFollowUp: e.target.value })} className="h-9 rounded-md border border-[#deded5] px-2 font-normal" /></label></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Textarea value={opsFor(selectedBusiness).notes} onChange={e => updateOps(selectedBusiness, { notes: e.target.value })} placeholder="Partner profile notes, needs, audience, authority, and opportunity..." className="min-h-20 border-[#deded5]" /><div className="rounded-lg bg-[#f8f7f3] p-3 text-xs"><div className="font-semibold">Recommended qualification checks</div><div className="mt-2 leading-5 text-[#6c7776]">Confirm the organization, decision-maker, customer access, market fit, partnership authority, expected deliverables, and commercial model before marking this prospect qualified.</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" onClick={() => addActivity(selectedBusiness, "Research checked", "Reviewed public company and contact information.")} className="rounded-full bg-[#173b46] text-white">Log research</Button><Button type="button" size="sm" onClick={() => addActivity(selectedBusiness, "Meeting", "Meeting or discovery conversation recorded.")} className="rounded-full bg-[#bd7b4b] text-white">Log meeting</Button></div></div></div>{opsFor(selectedBusiness).activities?.length > 0 && <div className="mt-3 border-t border-[#deded5] pt-3 text-xs"><div className="font-semibold">Activity history</div><div className="mt-2 grid gap-1 text-[#6c7776]">{opsFor(selectedBusiness).activities.slice(-5).reverse().map((activity: any, index: number) => <div key={index}>{activity.date.slice(0, 10)} · <strong>{activity.type}</strong> · {activity.note}</div>)}</div></div>}</div>}</div>
    <div className="mt-8 border-t border-white/15 pt-6"><div className="flex items-center justify-between"><h3 className="font-display text-xl">Saved outreach pipeline</h3><span className="text-xs text-white/55">{saved.length} saved</span></div>{saved.length ? <div className="mt-3 grid gap-3 lg:grid-cols-2">{saved.map((prospect: any) => <div key={prospect.id} className="rounded-2xl bg-white/10 p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold">Place ID {prospect.placeId}</div><div className="mt-1 text-xs text-white/55">{prospect.region} · {prospect.countryCode}</div></div><select value={prospect.status} onChange={e => update.mutate({ id: prospect.id, status: e.target.value as any })} className="h-9 rounded-md border-0 bg-white px-2 text-xs text-[#173b46]"><option value="new">New</option><option value="researching">Researching</option><option value="contacted">Contacted</option><option value="meeting">Meeting</option><option value="won">Won</option><option value="archived">Archived</option></select></div><Textarea defaultValue={prospect.notes || ""} placeholder="Add research notes…" className="mt-3 min-h-16 border-white/15 bg-white/10 text-white placeholder:text-white/40" onBlur={e => { if (e.target.value !== (prospect.notes || "")) update.mutate({ id: prospect.id, notes: e.target.value }); }} /></div>)}</div> : <p className="mt-3 text-sm text-white/55">Save a result to begin tracking research, outreach, meetings, and partnership outcomes.</p>}</div>
  </section>;
}

function AdminPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: properties = [], refetch } = trpc.properties.adminList.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  const { data: leads } = trpc.leads.adminList.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: registeredUsers = [] } = trpc.properties.users.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );
  const create = trpc.properties.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Property saved");
    },
  });
  const update = trpc.properties.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Property updated");
    },
  });
  const upload = trpc.properties.uploadMedia.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Property image uploaded");
    },
  });
  const deleteMedia = trpc.properties.deleteMedia.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Image removed");
    },
  });
  const reorderMedia = trpc.properties.reorderMedia.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Gallery order updated");
    },
  });
  const setHeroMedia = trpc.properties.setHeroMedia.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Hero image selected");
    },
  });
  const updatePrice = trpc.properties.updatePrice.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Guide price updated");
    },
  });
  const updateInquiry = trpc.leads.updateInquiry.useMutation({
    onSuccess: () => toast.success("Inquiry updated"),
  });
  const updatePartnership = trpc.leads.updatePartnership.useMutation({
    onSuccess: () => toast.success("Partnership lead updated"),
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draggedMediaId, setDraggedMediaId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    propertyType: "apartment",
    transactionType: "buy",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    neighborhood: "",
    agentName: "",
    agentWhatsapp: "",
    developerName: "",
    developerWhatsapp: "",
    price: 0,
    featured: false,
    published: false,
    latitude: null,
    longitude: null,
  });
  useEffect(() => {
    if (!loading && user?.role !== "admin") navigate("/admin/login");
  }, [loading, user, navigate]);
  if (loading || !user || user.role !== "admin")
    return (
      <div className="grid min-h-screen place-items-center text-[#6c7776]">
        Checking access…
      </div>
    );
  return (
    <div className="min-h-screen bg-[#f1f0ea]">
      <div className="border-b border-[#deded5] bg-white">
        <div className="container flex h-20 items-center justify-between">
          <BrandMark />
          <Link href="/" className="text-sm text-[#6c7776]">
            View public site <ArrowRight className="ml-2 inline h-4 w-4" />
          </Link>
        </div>
      </div>
      <main className="container py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">Private workspace</div>
            <h1 className="mt-3 font-display text-4xl text-[#173b46]">
              EdgePark operations.
            </h1>
          </div>
          <Badge className="w-fit bg-[#d9e4df] text-[#173b46]">
            Admin access
          </Badge>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5">
            <div className="text-xs text-[#6c7776]">Total listings</div>
            <div className="mt-2 text-3xl font-bold text-[#173b46]">
              {properties.length}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <div className="text-xs text-[#6c7776]">Property inquiries</div>
            <div className="mt-2 text-3xl font-bold text-[#173b46]">
              {leads?.inquiries?.length || 0}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <div className="text-xs text-[#6c7776]">
              Partnership applications
            </div>
            <div className="mt-2 text-3xl font-bold text-[#173b46]">
              {leads?.partnerships?.length || 0}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <div className="text-xs text-[#6c7776]">Registered users</div>
            <div className="mt-2 text-3xl font-bold text-[#173b46]">
              {registeredUsers.length}
            </div>
          </div>
        </div>
        <InternationalProspectingPanel />
        <section className="mt-8 rounded-[1.4rem] border border-[#deded5] bg-white p-6">
          <div className="eyebrow">Account directory</div>
          <h2 className="mt-2 font-display text-2xl text-[#173b46]">
            Registered users are recorded here.
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {registeredUsers.slice(0, 6).map((account: any) => (
              <div key={account.id} className="rounded-xl bg-[#f8f7f3] p-4">
                <div className="font-semibold text-[#173b46]">
                  {account.name || "Unnamed account"}
                </div>
                <div className="mt-1 text-sm text-[#6c7776]">
                  {account.email || "No email provided"}
                </div>
                <div className="mt-3 text-xs uppercase tracking-wider text-[#bd7b4b]">
                  {account.role} · {account.loginMethod || "secure auth"}
                </div>
              </div>
            ))}
            {!registeredUsers.length && (
              <div className="text-sm text-[#6c7776]">
                No account records yet. New secure sign-ins appear here
                automatically.
              </div>
            )}
          </div>
        </section>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-[1.4rem] border border-[#deded5] bg-white p-6">
            <div className="eyebrow">Create a listing</div>
            <div className="mt-5 grid gap-3">
              <Input
                placeholder="Property title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Slug (e.g. ikoyi-residence)"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                rows={5}
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.0000001"
                  placeholder="Latitude (verified only)"
                  value={form.latitude || ""}
                  onChange={e =>
                    setForm({
                      ...form,
                      latitude:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  step="0.0000001"
                  placeholder="Longitude (verified only)"
                  value={form.longitude || ""}
                  onChange={e =>
                    setForm({
                      ...form,
                      longitude:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={e =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Neighborhood (e.g. Lekki Phase 1)"
                  value={form.neighborhood}
                  onChange={e =>
                    setForm({ ...form, neighborhood: e.target.value })
                  }
                />
                <Input
                  placeholder="Agent WhatsApp (e.g. 2348012345678)"
                  value={form.agentWhatsapp}
                  onChange={e =>
                    setForm({ ...form, agentWhatsapp: e.target.value })
                  }
                />
                <Input
                  placeholder="Agent name"
                  value={form.agentName}
                  onChange={e =>
                    setForm({ ...form, agentName: e.target.value })
                  }
                />
                <Input
                  placeholder="Developer WhatsApp (e.g. 2348012345678)"
                  value={form.developerWhatsapp}
                  onChange={e =>
                    setForm({ ...form, developerWhatsapp: e.target.value })
                  }
                />
                <select
                  value={form.transactionType || "buy"}
                  onChange={e =>
                    setForm({ ...form, transactionType: e.target.value })
                  }
                  className="h-10 rounded-md border border-[#deded5] px-3 text-sm"
                >
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
                <select
                  value={form.propertyType}
                  onChange={e =>
                    setForm({ ...form, propertyType: e.target.value })
                  }
                  className="h-10 rounded-md border border-[#deded5] px-3 text-sm"
                >
                  <option value="apartment">Apartment</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="h-10 rounded-md border border-[#deded5] px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="available">Available</option>
                  <option value="under_offer">Under offer</option>
                  <option value="sold">Sold</option>
                  <option value="off_market">Off market</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={e =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />{" "}
                Publish listing
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />{" "}
                Feature on homepage
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    editingId
                      ? update.mutate({ ...form, id: editingId })
                      : create.mutate(form)
                  }
                  className="rounded-full bg-[#173b46] text-white"
                >
                  {editingId ? "Update property" : "Save property"}{" "}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        title: "",
                        slug: "",
                        description: "",
                        status: "draft",
                        propertyType: "apartment",
                        transactionType: "buy",
                        address: "",
                        city: "",
                        state: "",
                        country: "Nigeria",
                        neighborhood: "",
                        agentName: "",
                        agentWhatsapp: "",
                        developerName: "",
                        developerWhatsapp: "",
                        price: 0,
                        featured: false,
                        published: false,
                        latitude: null,
                        longitude: null,
                      });
                    }}
                  >
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
          <section className="rounded-[1.4rem] border border-[#deded5] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Inventory</div>
                <h2 className="mt-2 font-display text-2xl text-[#173b46]">
                  Listings & incoming leads
                </h2>
              </div>
              <span className="text-xs text-[#6c7776]">Live database</span>
            </div>
            <div className="mt-6 grid gap-3">
              {properties.length ? (
                properties.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-[#f8f7f3] p-4"
                  >
                    <div>
                      <div className="font-semibold text-[#173b46]">
                        {p.title}
                      </div>
                      <div className="mt-1 text-xs text-[#6c7776]">
                        {p.city} · {statusLabel(p.status)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() => {
                            setEditingId(p.id);
                            setForm({
                              ...p,
                              featured: Boolean(p.featured),
                              published: Boolean(p.published),
                              price: Number(p.price),
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Edit details
                        </Button>
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#173b46]">
                          Guide price{" "}
                          <Input
                            type="number"
                            defaultValue={p.price}
                            className="h-8 w-36 bg-white text-xs"
                            onBlur={e => {
                              const nextPrice = Number(e.currentTarget.value);
                              if (
                                nextPrice > 0 &&
                                nextPrice !== Number(p.price)
                              )
                                updatePrice.mutate(
                                  buildPriceUpdateInput(p.id, nextPrice)
                                );
                            }}
                          />
                        </label>
                      </div>
                      {p.media?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[...p.media]
                            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                            .map(
                              (
                                media: any,
                                mediaIndex: number,
                                ordered: any[]
                              ) => (
                                <div
                                  key={media.id}
                                  draggable
                                  onDragStart={() =>
                                    setDraggedMediaId(media.id)
                                  }
                                  onDragOver={event => event.preventDefault()}
                                  onDrop={() => {
                                    if (
                                      draggedMediaId == null ||
                                      draggedMediaId === media.id
                                    )
                                      return;
                                    const next = reorderMediaIds(
                                      ordered.map((item: any) => item.id),
                                      draggedMediaId,
                                      media.id
                                    );
                                    reorderMedia.mutate({
                                      propertyId: p.id,
                                      orderedIds: next,
                                    });
                                    setDraggedMediaId(null);
                                  }}
                                  onDragEnd={() => setDraggedMediaId(null)}
                                  className={`flex cursor-grab items-center gap-1 rounded-lg border p-1 active:cursor-grabbing ${media.isHero ? "border-[#bd7b4b]" : "border-[#deded5]"}`}
                                  aria-label={`Reorder ${media.fileName || "property image"}`}
                                >
                                  <img
                                    src={media.url}
                                    alt=""
                                    className="h-10 w-12 rounded object-cover"
                                  />
                                  <span
                                    className="text-[10px] text-[#6c7776]"
                                    aria-hidden="true"
                                  >
                                    ⋮⋮
                                  </span>
                                  <button
                                    type="button"
                                    className="text-[10px] font-semibold text-[#bd7b4b]"
                                    onClick={() =>
                                      setHeroMedia.mutate({
                                        propertyId: p.id,
                                        mediaId: media.id,
                                      })
                                    }
                                  >
                                    {media.isHero ? "Hero" : "Set hero"}
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-[#173b46]"
                                    disabled={mediaIndex === 0}
                                    onClick={() =>
                                      reorderMedia.mutate({
                                        propertyId: p.id,
                                        orderedIds: ordered.map(
                                          (item: any, index: number) =>
                                            index === mediaIndex - 1
                                              ? media.id
                                              : index === mediaIndex
                                                ? ordered[index - 1].id
                                                : item.id
                                        ),
                                      })
                                    }
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-[#173b46]"
                                    disabled={mediaIndex === ordered.length - 1}
                                    onClick={() =>
                                      reorderMedia.mutate({
                                        propertyId: p.id,
                                        orderedIds: ordered.map(
                                          (item: any, index: number) =>
                                            index === mediaIndex + 1
                                              ? media.id
                                              : index === mediaIndex
                                                ? ordered[index + 1].id
                                                : item.id
                                        ),
                                      })
                                    }
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs text-red-700"
                                    onClick={() =>
                                      deleteMedia.mutate({ id: media.id })
                                    }
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            )}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer rounded-full border border-[#deded5] px-3 py-1 text-xs font-semibold text-[#173b46]">
                          Add photo
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => {
                              Array.from(e.target.files || []).forEach(file => {
                                const reader = new FileReader();
                                reader.onload = () =>
                                  upload.mutate({
                                    propertyId: p.id,
                                    fileName: file.name,
                                    mimeType: file.type,
                                    dataBase64:
                                      String(reader.result).split(",")[1] || "",
                                    isHero: !p.media?.length,
                                  });
                                reader.readAsDataURL(file);
                              });
                            }}
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              p.published
                                ? "bg-[#d9e4df] text-[#173b46]"
                                : "bg-[#ebe9e1] text-[#6c7776]"
                            }
                          >
                            {p.published ? "Published" : "Draft"}
                          </Badge>
                          {p.isDemo ? (
                            <Badge className="bg-[#f4dfce] text-[#8f5735]">
                              Demo · {p.verificationStatus || "unverified"}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#deded5] p-8 text-center text-sm text-[#6c7776]">
                  No listings yet. Create the first opportunity with the form.
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-[#deded5] pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="eyebrow">Leads inbox</div>
                  <p className="mt-2 text-sm text-[#6c7776]">Review enquiries, update status, and start a personal follow-up.</p>
                </div>
                <a href="/email/property-pitch.html" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-[#173b46]/15 px-4 py-2 text-xs font-semibold text-[#173b46] hover:bg-[#ebe9e1]">Open pitch email template <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></a>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ...(leads?.inquiries || []),
                  ...(leads?.partnerships || []),
                ].map((lead: any, i) => (
                  <div
                    key={lead.id || i}
                    className="rounded-xl border border-[#deded5] p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="font-semibold text-[#173b46]">
                        {lead.name}
                      </div>
                      {lead.role ? (
                        <select
                          value={lead.status}
                          onChange={e =>
                            updatePartnership.mutate({
                              id: lead.id,
                              status: e.target.value as any,
                              note:
                                window.prompt("Response note (optional)") ||
                                undefined,
                            })
                          }
                          className="rounded-md border border-[#deded5] bg-white px-2 py-1 text-xs uppercase tracking-wider text-[#bd7b4b]"
                        >
                          <option value="new">new</option>
                          <option value="reviewed">reviewed</option>
                          <option value="contacted">contacted</option>
                          <option value="approved">approved</option>
                          <option value="declined">declined</option>
                        </select>
                      ) : (
                        <select
                          value={lead.status}
                          onChange={e =>
                            updateInquiry.mutate({
                              id: lead.id,
                              status: e.target.value as any,
                              note:
                                window.prompt("Response note (optional)") ||
                                undefined,
                            })
                          }
                          className="rounded-md border border-[#deded5] bg-white px-2 py-1 text-xs uppercase tracking-wider text-[#bd7b4b]"
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="qualified">qualified</option>
                          <option value="closed">closed</option>
                        </select>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[#6c7776]">
                      {lead.email} · {lead.role || "Property inquiry"}
                    </div>
                    {lead.role && (
                      <div className="mt-3 grid gap-2 text-xs text-[#6c7776] sm:grid-cols-2">
                        <div>
                          <span className="font-semibold text-[#173b46]">
                            Phone:
                          </span>{" "}
                          {lead.phone || "Not provided"}
                        </div>
                        <div>
                          <span className="font-semibold text-[#173b46]">
                            Company:
                          </span>{" "}
                          {lead.company || "Not provided"}
                        </div>
                        <div>
                          <span className="font-semibold text-[#173b46]">
                            Investment / project scale:
                          </span>{" "}
                          {lead.investmentRange || "Not provided"}
                        </div>
                        <div>
                          <span className="font-semibold text-[#173b46]">
                            Account:
                          </span>{" "}
                          {lead.userId
                            ? `Signed-in user #${lead.userId}`
                            : "Guest submission"}
                        </div>
                      </div>
                    )}
                    <p className="mt-3 text-sm leading-6 text-[#6c7776]">
                      {lead.message}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={buildLeadEmailLink(lead)} className="inline-flex items-center rounded-full bg-[#173b46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#102d36]"><Mail className="mr-2 h-3.5 w-3.5" />Email this lead</a>
                      {lead.phone ? <a href={`https://wa.me/${String(lead.phone).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-[#deded5] px-4 py-2 text-xs font-semibold text-[#173b46] hover:bg-[#ebe9e1]"><MessageCircle className="mr-2 h-3.5 w-3.5" />WhatsApp</a> : null}
                    </div>
                  </div>
                ))}
                {!leads?.inquiries?.length && !leads?.partnerships?.length && (
                  <div className="text-sm text-[#6c7776]">
                    No new leads yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
export default function Home() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/shortlist" component={ShortlistPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/properties" component={ListingsPage} />
      <Route path="/property/:slug" component={PropertyPage} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/partner" component={PartnerPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={HomePage} />
    </Switch>
  );
}
