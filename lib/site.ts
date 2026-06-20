import { PROPERTY_AGENTS, defaultPropertyAgent } from "@/data/agents";
import {
  LISTING_TYPES,
  type ListingType,
  type PropertyUsage,
} from "@/types/property";

export const siteName = "Rise Property";
export const siteDescription =
  "Luxury real estate listings in Qatar with curated homes, rentals, and investment properties.";
export const siteContact = {
  email: "maha@rise-property.com",
  privacyEmail: "maha@rise-property.com",
  phoneDisplay: "+974 3111 6240",
  phoneHref: "+97431116240",
  whatsappNumber: "97431116240",
  websiteLabel: "www.rise-property.com",
  websiteUrl: "https://www.rise-property.com",
  address: "6FGW+J78, Doha, Qatar",
  tradingLicenceNumber: "C.R Number (Commercial Registration) 232 559",
} as const;

export { defaultPropertyAgent };
export const propertyAgents = PROPERTY_AGENTS;

export const siteEmail = siteContact.email;
export const privacyEmail = siteContact.privacyEmail;
export const sitePhone = siteContact.phoneDisplay;
export const sitePhoneHref = siteContact.phoneHref;
export const whatsappNumber = siteContact.whatsappNumber;
export const whatsappUrl = `https://wa.me/${whatsappNumber}`;
export const siteWebsiteLabel = siteContact.websiteLabel;
export const siteWebsiteUrl = siteContact.websiteUrl;
export const siteAddress = siteContact.address;
export const siteTradingLicenceNumber = siteContact.tradingLicenceNumber;
export const siteCopyrightYear = "2026";
export const legalLastUpdated = "25 March 2026";
export const legalEntityName = "Rise Property";
export const legalRepresentative =
  "Replace with the authorised managing director or legal representative";
export const legalRegisterNumber =
  "Replace with the commercial register or company registration number";
export const legalVatNumber =
  "Replace with the VAT ID or local tax registration number";
export const legalSupervisoryAuthority =
  "Replace with the competent supervisory or licensing authority, if applicable";
export const legalEditorialResponsibility =
  "Replace with the person responsible for editorial content";
export const legalProfessionalRules =
  "Replace with the applicable professional rules, chamber membership, or licensing framework if required";
export const consumerRedressUrl =
  "https://consumer-redress.ec.europa.eu/dispute-resolution-bodies";
export const legalReadinessNotice =
  "This legal information layer is prepared for EU-facing operations, but placeholder registration details must be replaced with your official company data before go-live.";
export const socialLinks = {
  instagram: "#",
  facebook: "#",
  linkedin: "#",
  x: "#",
  reddit: "#",
  tiktok: "#",
};
export const arabicSiteUrl = "#";

export interface ListingPathOptions {
  query?: string | null;
  priceRange?: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  sortBy?: string | null;
  propertyType?: string | null;
  furnished?: string | null;
  usage?: PropertyUsage | null;
}

export interface SearchPathOptions extends ListingPathOptions {
  listingType?: ListingType | null;
}

function normalizeBaseUrl(value?: string | null) {
  const fallback = "http://localhost:3000";
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    const normalized = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(normalized);
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function getSiteUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function absoluteUrl(path = "/") {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function createListingQueryParams(config: ListingPathOptions) {
  const params = new URLSearchParams();
  const cleanQuery = config.query?.trim();

  if (cleanQuery) {
    params.set("q", cleanQuery);
  }

  if (config.priceRange && config.priceRange !== "all") {
    params.set("price", config.priceRange);
  }

  if (config.bedrooms && config.bedrooms !== "all") {
    params.set("beds", config.bedrooms);
  }

  if (config.bathrooms && config.bathrooms !== "all") {
    params.set("baths", config.bathrooms);
  }

  if (config.sortBy && config.sortBy !== "price-desc") {
    params.set("sort", config.sortBy);
  }

  if (config.propertyType && config.propertyType !== "all") {
    params.set("propertyType", config.propertyType);
  }

  if (config.furnished && config.furnished !== "all") {
    params.set("furnished", config.furnished);
  }

  if (config.usage) {
    params.set("usage", config.usage);
  }

  return params;
}

export function buildQueryPath(basePath: string, config: ListingPathOptions) {
  const params = createListingQueryParams(config);
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function buildListingPath(
  type: ListingType,
  options?: string | ListingPathOptions | null,
) {
  const config =
    typeof options === "string"
      ? { query: options }
      : {
          query: options?.query,
          priceRange: options?.priceRange,
          bedrooms: options?.bedrooms,
          bathrooms: options?.bathrooms,
          sortBy: options?.sortBy,
          propertyType: options?.propertyType,
          furnished: options?.furnished,
          usage: options?.usage,
        };

  return buildQueryPath(`/${type}`, config);
}

export function buildSearchPath(options?: SearchPathOptions | null) {
  const params = createListingQueryParams({
    query: options?.query,
    priceRange: options?.priceRange,
    bedrooms: options?.bedrooms,
    bathrooms: options?.bathrooms,
    sortBy: options?.sortBy,
    propertyType: options?.propertyType,
    furnished: options?.furnished,
    usage: options?.usage,
  });

  params.set("listing", options?.listingType ?? LISTING_TYPES[1]);

  const queryString = params.toString();
  return queryString ? `/search?${queryString}` : "/search";
}

export function buildWhatsAppInquiry(message: string) {
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}
