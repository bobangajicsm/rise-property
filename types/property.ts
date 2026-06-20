export interface Area {
  name: string;
  image: string;
  center: [number, number];
}

export const PROPERTY_USAGE_RESIDENTIAL = "residential";
export const PROPERTY_USAGE_COMMERCIAL = "commercial";
export const PROPERTY_USAGE_INTERNATIONAL = "international";
export const PROPERTY_USAGES = [
  PROPERTY_USAGE_RESIDENTIAL,
  PROPERTY_USAGE_COMMERCIAL,
  PROPERTY_USAGE_INTERNATIONAL,
] as const;
export type PropertyUsage = (typeof PROPERTY_USAGES)[number];

export const LISTING_TYPES = ["buy", "rent"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];
export const PROPERTY_VISIBILITY_DRAFT = "draft";
export const PROPERTY_VISIBILITY_PUBLISHED = "published";
export const PROPERTY_VISIBILITY_STATUSES = [
  PROPERTY_VISIBILITY_DRAFT,
  PROPERTY_VISIBILITY_PUBLISHED,
] as const;
export type PropertyVisibilityStatus = (typeof PROPERTY_VISIBILITY_STATUSES)[number];

export const PROPERTY_USAGE_META = {
  [PROPERTY_USAGE_RESIDENTIAL]: {
    label: "Residential",
  },
  [PROPERTY_USAGE_COMMERCIAL]: {
    label: "Commercial",
  },
  [PROPERTY_USAGE_INTERNATIONAL]: {
    label: "International",
  },
} as const satisfies Record<PropertyUsage, { label: string }>;

export const LISTING_TYPE_META = {
  buy: {
    label: "Buy",
    actionLabel: "For Sale",
    collectionLabel: "Sales",
  },
  rent: {
    label: "Rent",
    actionLabel: "For Rent",
    collectionLabel: "Rentals",
  },
} as const satisfies Record<
  ListingType,
  {
    label: string;
    actionLabel: string;
    collectionLabel: string;
  }
>;

export const PROPERTY_VISIBILITY_META = {
  [PROPERTY_VISIBILITY_DRAFT]: {
    label: "Draft",
    adminLabel: "Saved as Draft",
    publicLabel: "Hidden from website",
  },
  [PROPERTY_VISIBILITY_PUBLISHED]: {
    label: "Published",
    adminLabel: "Live on website",
    publicLabel: "Visible on website",
  },
} as const satisfies Record<
  PropertyVisibilityStatus,
  { label: string; adminLabel: string; publicLabel: string }
>;

export function normalizePropertyUsage(
  value: string | null | undefined,
  fallback: PropertyUsage = PROPERTY_USAGES[0],
): PropertyUsage {
  return PROPERTY_USAGES.includes(value as PropertyUsage)
    ? (value as PropertyUsage)
    : fallback;
}

export function normalizeListingType(
  value: string | null | undefined,
  fallback: ListingType = LISTING_TYPES[0],
): ListingType {
  return LISTING_TYPES.includes(value as ListingType)
    ? (value as ListingType)
    : fallback;
}

export function normalizePropertyVisibilityStatus(
  value: string | null | undefined,
  fallback: PropertyVisibilityStatus = PROPERTY_VISIBILITY_PUBLISHED,
): PropertyVisibilityStatus {
  return PROPERTY_VISIBILITY_STATUSES.includes(value as PropertyVisibilityStatus)
    ? (value as PropertyVisibilityStatus)
    : fallback;
}

export interface FeaturedAreaConfig extends Area {
  isPremium: boolean;
  listingCount: number;
  coverImage?: string;
  baseImage?: string;
  coverSource: "manual" | "inventory" | "default";
}

export interface FeaturedAreaMutationInput {
  name: string;
  center: [number, number];
  baseImage?: string;
  isPremium: boolean;
  coverImage?: string;
}

export interface PropertyAgent {
  id?: string;
  name: string;
  role: string;
  image: string;
  phone: string;
  email?: string;
  whatsapp?: string;
}

export interface PropertyAgentDirectoryEntry extends PropertyAgent {
  id: string;
  email: string;
  whatsapp: string;
}

export interface Property {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: number;
  period: string;
  beds: number;
  baths: number;
  sqft: string;
  images: string[];
  badges: string[];
  type: string;
  listingType: ListingType;
  visibilityStatus: PropertyVisibilityStatus;
  usage: PropertyUsage;
  area: string;
  lat: number;
  lng: number;
  description: string;
  features: string[];
  yearBuilt?: number;
  parking?: number;
  furnished?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  agent: PropertyAgent;
}

export interface PropertyMutationInput {
  id?: number;
  title: string;
  location: string;
  price: number;
  period?: string;
  beds: number;
  baths: number;
  sqft: string;
  images: string[];
  badges: string[];
  type: string;
  listingType: ListingType;
  visibilityStatus: PropertyVisibilityStatus;
  usage: PropertyUsage;
  area: string;
  lat: number;
  lng: number;
  description: string;
  features: string[];
  yearBuilt?: number;
  parking?: number;
  furnished?: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  agent: PropertyAgent;
}

export interface PropertyTypeConfig {
  id: string;
  label: string;
  usage: PropertyUsage;
  isActive: boolean;
  sortOrder: number;
  listingCount: number;
}

export interface PropertyTypeMutationInput {
  id: string;
  label: string;
  usage: PropertyUsage;
  isActive: boolean;
  sortOrder: number;
}

export interface PopularLink {
  label: string;
  href: string;
}

export interface LinkGroup {
  title: string;
  links: PopularLink[];
}
