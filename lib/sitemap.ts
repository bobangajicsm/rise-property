import { SEARCH_LOCATIONS } from "@/data/properties";
import { SEO_SEARCH_PAGES, buildSeoSearchPath } from "@/data/seo-search-pages";
import { getAllProperties } from "@/lib/properties-store";
import { absoluteUrl, buildListingPath, buildSearchPath } from "@/lib/site";
import {
  LISTING_TYPES,
  PROPERTY_USAGES,
  type ListingType,
  type PropertyUsage,
} from "@/types/property";

export interface SitemapEntry {
  path: string;
  url: string;
  category: "core" | "seo" | "curated" | "property";
  priority: number;
  changeFrequency: "weekly";
  lastModified: Date;
  images?: string[];
}

function createEntry(
  path: string,
  category: SitemapEntry["category"],
  priority: number,
  now: Date,
  images?: string[],
): SitemapEntry {
  return {
    path,
    url: absoluteUrl(path),
    category,
    priority,
    changeFrequency: "weekly",
    lastModified: now,
    images: images?.filter(Boolean),
  };
}

function buildCuratedListingPaths() {
  const featuredLocations = SEARCH_LOCATIONS.filter(
    (location) => location !== "Qatar" && location !== "Doha",
  ).slice(0, 10);
  const residentialBeds = ["1", "2", "3", "4"] as const;
  const propertyTypeCombos: Array<{
    type: ListingType;
    propertyType: string;
    usage: PropertyUsage;
  }> = [
    { type: "buy", propertyType: "Apartment", usage: "residential" },
    { type: "rent", propertyType: "Apartment", usage: "residential" },
    { type: "buy", propertyType: "Villa", usage: "residential" },
    { type: "rent", propertyType: "Villa", usage: "residential" },
    { type: "buy", propertyType: "Penthouse", usage: "residential" },
    { type: "rent", propertyType: "Penthouse", usage: "residential" },
    { type: "buy", propertyType: "Office", usage: "commercial" },
    { type: "rent", propertyType: "Office", usage: "commercial" },
  ];

  return [
    ...LISTING_TYPES.flatMap((type) =>
      featuredLocations.map((location) =>
        buildListingPath(type, {
          query: location,
          usage: "residential",
        }),
      ),
    ),
    ...LISTING_TYPES.flatMap((type) =>
      PROPERTY_USAGES.map((usage) =>
        buildListingPath(type, {
          usage,
        }),
      ),
    ),
    ...LISTING_TYPES.flatMap((type) =>
      residentialBeds.map((bedrooms) =>
        buildListingPath(type, {
          bedrooms,
          usage: "residential",
        }),
      ),
    ),
    ...propertyTypeCombos.map((combo) =>
      buildListingPath(combo.type, {
        propertyType: combo.propertyType,
        usage: combo.usage,
      }),
    ),
    ...featuredLocations.flatMap((location) =>
      LISTING_TYPES.map((listingType) =>
        buildSearchPath({
          listingType,
          query: location,
          usage: "residential",
        }),
      ),
    ),
  ];
}

export async function buildSitemapEntries() {
  const now = new Date();
  const properties = await getAllProperties();
  const curatedPaths = buildCuratedListingPaths();

  const entries = [
    createEntry("/", "core", 1, now),
    createEntry("/buy", "core", 0.95, now),
    createEntry("/rent", "core", 0.95, now),
    createEntry("/search", "core", 0.92, now),
    createEntry("/sitemap", "core", 0.5, now),
    createEntry("/privacy-policy", "core", 0.2, now),
    createEntry("/cookie-policy", "core", 0.2, now),
    createEntry("/terms-and-conditions", "core", 0.2, now),
    createEntry("/impressum", "core", 0.2, now),
    ...SEO_SEARCH_PAGES.map((page) =>
      createEntry(buildSeoSearchPath(page.slug), "seo", 0.82, now),
    ),
    ...curatedPaths.map((path) => createEntry(path, "curated", 0.72, now)),
    ...properties.map((property) =>
      createEntry(
        `/properties/${property.slug}`,
        "property",
        0.88,
        now,
        property.images.slice(0, 1),
      ),
    ),
  ];

  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
