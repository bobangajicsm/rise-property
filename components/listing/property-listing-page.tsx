'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bath,
  Bed,
  ChevronUp,
  LayoutGrid,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import { BrandMark } from "@/components/home/brand-mark";
import { MapLoading } from "@/components/maps/map-loading";
import { AREAS, SEARCH_LOCATIONS } from "@/data/properties";
import { getLocationSuggestions } from "@/lib/location-autocomplete";
import {
  applyDrawnMapFilters,
  DrawnMapItem,
} from "@/lib/map-filters";
import {
  extractSqftValue,
  formatPrice,
  formatPropertyReference,
  getPropertyUsage,
} from "@/lib/property-formatting";
import { buildPropertyTypeOptions } from "@/lib/property-types";
import {
  hasShortcutIntent,
  matchesShortcutIntent,
  parsePropertySearchIntent,
} from "@/lib/search-intent";
import {
  buildListingPath,
  buildQueryPath,
  buildSearchPath,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  LISTING_TYPE_META,
  LISTING_TYPES,
  PROPERTY_USAGE_COMMERCIAL,
  PROPERTY_USAGE_META,
  PROPERTY_USAGE_RESIDENTIAL,
  PROPERTY_USAGES,
  type Property,
  type PropertyTypeConfig,
} from "@/types/property";

const PropertyListingMap = dynamic(
  () =>
    import("@/components/maps/property-listing-map").then(
      (mod) => mod.PropertyListingMap,
    ),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

const DEFAULT_FILTERS = {
  priceRange: "all",
  bedrooms: "all",
  bathrooms: "all",
  sortBy: "price-desc",
  propertyType: "all",
  furnished: "all",
} as const;

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
}

function sortPropertiesBySelectedOrder(
  properties: Property[],
  sortBy: "price-desc" | "price-asc" | "beds-desc",
) {
  return [...properties].sort((first, second) => {
    if (sortBy === "price-asc") {
      return first.price - second.price;
    }
    if (sortBy === "beds-desc") {
      return second.beds - first.beds;
    }
    return second.price - first.price;
  });
}

function comparePropertiesBySelectedOrder(
  first: Property,
  second: Property,
  sortBy: "price-desc" | "price-asc" | "beds-desc",
) {
  if (sortBy === "price-asc") {
    return first.price - second.price;
  }

  if (sortBy === "beds-desc") {
    return second.beds - first.beds;
  }

  return second.price - first.price;
}

function getSearchMatchScore(property: Property, query: string) {
  const intent = parsePropertySearchIntent(query);
  const normalizedQuery = intent.cleanedQuery || intent.normalizedQuery;

  if (!normalizedQuery && !hasShortcutIntent(intent)) {
    return 0;
  }

  if (!matchesShortcutIntent(property, intent)) {
    return 0;
  }

  const normalizedArea = property.area.toLowerCase();
  const normalizedLocation = property.location.toLowerCase();
  const normalizedTitle = property.title.toLowerCase();
  const normalizedType = property.type.toLowerCase();
  const normalizedReference = formatPropertyReference(property.id).toLowerCase();
  const normalizedId = String(property.id).toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = 40;

  if (intent.bedrooms) {
    score += intent.bedrooms === "4" ? property.beds * 14 : 100;
  }

  if (intent.propertyMatchers.length > 0) {
    score += 75;
  }

  if (!normalizedQuery) {
    return score + getListingDiscoveryScore(property);
  }

  if (normalizedArea === normalizedQuery) score += 400;
  else if (normalizedArea.startsWith(normalizedQuery)) score += 280;
  else if (normalizedArea.includes(normalizedQuery)) score += 180;

  if (normalizedLocation === normalizedQuery) score += 260;
  else if (normalizedLocation.startsWith(normalizedQuery)) score += 180;
  else if (normalizedLocation.includes(normalizedQuery)) score += 110;

  if (normalizedTitle === normalizedQuery) score += 220;
  else if (normalizedTitle.startsWith(normalizedQuery)) score += 130;
  else if (normalizedTitle.includes(normalizedQuery)) score += 70;

  if (normalizedReference === normalizedQuery || normalizedId === normalizedQuery) {
    score += 240;
  }

  for (const token of queryTokens) {
    if (normalizedArea.split(/\s+/).some((part) => part === token)) score += 45;
    else if (normalizedArea.includes(token)) score += 25;

    if (normalizedLocation.split(/\s+/).some((part) => part === token)) score += 35;
    else if (normalizedLocation.includes(token)) score += 18;

    if (normalizedTitle.split(/\s+/).some((part) => part === token)) score += 24;
    else if (normalizedTitle.includes(token)) score += 12;

    if (normalizedType.includes(token)) score += 8;
  }

  return score;
}

function sortPropertiesBySearchRelevance(
  properties: Property[],
  query: string,
  sortBy: "price-desc" | "price-asc" | "beds-desc",
) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return sortPropertiesBySelectedOrder(properties, sortBy);
  }

  return [...properties].sort((first, second) => {
    const relevanceDelta =
      getSearchMatchScore(second, normalizedQuery) -
      getSearchMatchScore(first, normalizedQuery);

    if (relevanceDelta !== 0) {
      return relevanceDelta;
    }

    return comparePropertiesBySelectedOrder(first, second, sortBy);
  });
}

function getListingDiscoveryScore(property: Property) {
  let score = 0;

  if (property.badges.includes("FEATURED")) score += 220;
  if (property.badges.includes("LUXURY")) score += 180;
  if (property.badges.includes("PREMIUM")) score += 140;
  if (property.badges.includes("EXCLUSIVE")) score += 100;
  if (property.badges.includes("NEW")) score += 40;
  if (property.price >= 10_000_000) score += 24;
  else if (property.price >= 2_000_000) score += 12;

  return score;
}

function sortPropertiesForDiscovery(
  properties: Property[],
  sortBy: "price-desc" | "price-asc" | "beds-desc",
) {
  return [...properties].sort((first, second) => {
    const scoreDelta =
      getListingDiscoveryScore(second) - getListingDiscoveryScore(first);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return comparePropertiesBySelectedOrder(first, second, sortBy);
  });
}

function matchesSearchQuery(property: Property, query: string) {
  if (!query) {
    return true;
  }

  const intent = parsePropertySearchIntent(query);

  if (!matchesShortcutIntent(property, intent)) {
    return false;
  }

  if (!intent.cleanedQuery) {
    return hasShortcutIntent(intent);
  }

  const tokens = intent.cleanedQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const haystack = [
    property.location,
    property.area,
    property.title,
    property.type,
    formatPropertyReference(property.id),
    String(property.id),
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

function getLocationAlternatives(query: string, locations: string[]) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return [...new Set(locations)]
    .map((location) => {
      const normalizedLocation = location.toLowerCase();
      let score = 0;

      if (
        normalizedLocation.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedLocation)
      ) {
        score += 6;
      }

      for (const token of queryTokens) {
        if (normalizedLocation === token) {
          score += 5;
          continue;
        }

        if (normalizedLocation.startsWith(token)) {
          score += 4;
          continue;
        }

        if (normalizedLocation.split(/\s+/).some((part) => part.startsWith(token))) {
          score += 3;
          continue;
        }

        if (normalizedLocation.includes(token)) {
          score += 2;
        }
      }

      return {
        location,
        score,
      };
    })
    .filter(
      (item) => item.score > 0 && item.location.toLowerCase() !== normalizedQuery,
    )
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map((item) => item.location);
}

function formatPriceRangeLabel(
  type: Property["listingType"] | null,
  value: string,
) {
  if (!type) {
    if (value === "low") return "Lower Price";
    if (value === "mid") return "Mid Price";
    if (value === "high") return "Premium Price";
    return "";
  }

  if (value === "low") {
    return type === LISTING_TYPES[0] ? "Under 2M QAR" : "Under 10K QAR";
  }

  if (value === "mid") {
    return type === LISTING_TYPES[0] ? "2M - 10M QAR" : "10K - 25K QAR";
  }

  if (value === "high") {
    return type === LISTING_TYPES[0] ? "10M+ QAR" : "25K+ QAR";
  }

  return "";
}

function formatBedroomsLabel(value: string) {
  if (value === "all") {
    return "Any Bedrooms";
  }

  if (value === "4") {
    return "4+ Bedrooms";
  }

  if (value === "0") {
    return "Studio";
  }

  return `${value} Bedroom${value === "1" ? "" : "s"}`;
}

function formatBathroomsLabel(value: string) {
  if (value === "all") {
    return "Any Bathrooms";
  }

  if (value === "4") {
    return "4+ Bathrooms";
  }

  return `${value} Bathroom${value === "1" ? "" : "s"}`;
}

function formatFurnishedLabel(value: string) {
  if (value === "all") {
    return "Any Furnishing";
  }

  return value === "furnished" ? "Furnished" : "Unfurnished";
}

function FilterSelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <span className="text-[9px] font-bold tracking-[0.18em] text-gray-400 uppercase">
        {label}
      </span>
      <select
        className="mt-1.5 w-full bg-transparent text-[13px] font-semibold text-black outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

interface PropertyListingPageProps {
  properties: Property[];
  propertyTypes: PropertyTypeConfig[];
  type: Property["listingType"] | null;
  initialArea?: string | null;
  initialQuery?: string | null;
  initialPriceRange?: string | null;
  initialBedrooms?: string | null;
  initialBathrooms?: string | null;
  initialSortBy?: string | null;
  initialPropertyType?: string | null;
  initialFurnished?: string | null;
  initialUsage?: Property["usage"] | null;
  urlBasePath?: string;
  urlSyncMode?: "type-route" | "search-route" | "base-path";
  headerEyebrow?: string;
  headerTitle?: string;
  headerDescription?: string;
}

export function PropertyListingPage({
  properties,
  propertyTypes,
  type,
  initialArea,
  initialQuery,
  initialPriceRange,
  initialBedrooms,
  initialBathrooms,
  initialSortBy,
  initialPropertyType,
  initialFurnished,
  initialUsage,
  urlBasePath,
  urlSyncMode = "type-route",
  headerEyebrow,
  headerTitle,
  headerDescription,
}: PropertyListingPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const headerRef = useRef<HTMLElement | null>(null);
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const initialAppliedLocation = initialQuery ?? initialArea ?? "";
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [mobileMapPrimed, setMobileMapPrimed] = useState(false);
  const [mapFocusMode, setMapFocusMode] = useState<"active" | "bounds">("bounds");
  const [mobileMapOffset, setMobileMapOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialAppliedLocation);
  const [appliedLocation, setAppliedLocation] = useState(initialAppliedLocation);
  const [usage, setUsage] = useState<Property["usage"]>(
    initialUsage ?? PROPERTY_USAGE_RESIDENTIAL,
  );
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [drawnItems, setDrawnItems] = useState<DrawnMapItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: initialPriceRange ?? DEFAULT_FILTERS.priceRange,
    bedrooms: initialBedrooms ?? DEFAULT_FILTERS.bedrooms,
    bathrooms: initialBathrooms ?? DEFAULT_FILTERS.bathrooms,
    sortBy: initialSortBy ?? DEFAULT_FILTERS.sortBy,
    propertyType: initialPropertyType ?? DEFAULT_FILTERS.propertyType,
    furnished: initialFurnished ?? DEFAULT_FILTERS.furnished,
  });
  const appliedSearchIntent = useMemo(
    () => parsePropertySearchIntent(appliedLocation),
    [appliedLocation],
  );

  useEffect(() => {
    void import("@/components/maps/property-listing-map");
  }, []);

  useEffect(() => {
    if (!isMobileViewport()) {
      return;
    }

    const primeMap = () => setMobileMapPrimed(true);
    const browserWindow = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

    if (
      typeof browserWindow.requestIdleCallback === "function" &&
      typeof browserWindow.cancelIdleCallback === "function"
    ) {
      const idleId = browserWindow.requestIdleCallback(primeMap, { timeout: 900 });
      return () => browserWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(primeMap, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setAppliedLocation(initialAppliedLocation);
    setSearchQuery(initialAppliedLocation);
  }, [initialAppliedLocation]);

  useEffect(() => {
    setUsage(initialUsage ?? PROPERTY_USAGE_RESIDENTIAL);
  }, [initialUsage]);

  useEffect(() => {
    setFilters({
      priceRange: initialPriceRange ?? DEFAULT_FILTERS.priceRange,
      bedrooms: initialBedrooms ?? DEFAULT_FILTERS.bedrooms,
      bathrooms: initialBathrooms ?? DEFAULT_FILTERS.bathrooms,
      sortBy: initialSortBy ?? DEFAULT_FILTERS.sortBy,
      propertyType: initialPropertyType ?? DEFAULT_FILTERS.propertyType,
      furnished: initialFurnished ?? DEFAULT_FILTERS.furnished,
    });
  }, [
    initialBathrooms,
    initialBedrooms,
    initialFurnished,
    initialPriceRange,
    initialPropertyType,
    initialSortBy,
  ]);

  useEffect(() => {
    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({
      top: 0,
      behavior: "auto",
    });

    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash.startsWith("#prop-")) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [
    initialAppliedLocation,
    initialArea,
    initialBedrooms,
    initialPriceRange,
    initialPropertyType,
    initialSortBy,
    initialUsage,
    type,
  ]);

  useEffect(() => {
    const updateHeaderOffset = () => {
      setMobileMapOffset(headerRef.current?.getBoundingClientRect().height ?? 0);
    };

    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset);

    return () => window.removeEventListener("resize", updateHeaderOffset);
  }, [showFilters]);

  useEffect(() => {
    const scrollContainer = listScrollRef.current;

    const updateScrollTopVisibility = () => {
      if (isMobileViewport()) {
        setShowScrollTop(window.scrollY > 320);
        return;
      }

      setShowScrollTop((scrollContainer?.scrollTop ?? 0) > 320);
    };

    updateScrollTopVisibility();
    scrollContainer?.addEventListener("scroll", updateScrollTopVisibility, {
      passive: true,
    });
    window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
    window.addEventListener("resize", updateScrollTopVisibility);

    return () => {
      scrollContainer?.removeEventListener("scroll", updateScrollTopVisibility);
      window.removeEventListener("scroll", updateScrollTopVisibility);
      window.removeEventListener("resize", updateScrollTopVisibility);
    };
  }, []);

  useEffect(() => {
    if (!showMapMobile) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    setShowFilters(false);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showMapMobile]);

  const locationPool = useMemo(() => {
    const derivedLocations = properties.flatMap((property) => [
      property.area,
      property.location.replace(/,\s*Qatar$/i, ""),
    ]);

    return [...new Set([...SEARCH_LOCATIONS, ...AREAS.map((area) => area.name), ...derivedLocations])];
  }, [properties]);

  const suggestions = useMemo(() => {
    return getLocationSuggestions({
      query: searchQuery,
      primaryLocations: SEARCH_LOCATIONS,
      secondaryLocations: locationPool,
    });
  }, [locationPool, searchQuery]);

  const baseFilteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesListingType = !type || property.listingType === type;
      const matchesArea = !initialArea || property.area === initialArea;
      const matchesBedrooms =
        filters.bedrooms === "all" ||
        (filters.bedrooms === "4"
          ? property.beds >= 4
          : property.beds === Number.parseInt(filters.bedrooms, 10));
      const matchesBathrooms =
        filters.bathrooms === "all" ||
        (filters.bathrooms === "4"
          ? property.baths >= 4
          : property.baths === Number.parseInt(filters.bathrooms, 10));
      const matchesPropertyType =
        filters.propertyType === "all" || property.type === filters.propertyType;
      const matchesFurnished =
        filters.furnished === "all" ||
        (filters.furnished === "furnished"
          ? property.furnished === true
          : property.furnished === false);

      let matchesPrice = true;
      if (property.listingType === LISTING_TYPES[0]) {
        if (filters.priceRange === "low") {
          matchesPrice = property.price < 2_000_000;
        }
        if (filters.priceRange === "mid") {
          matchesPrice = property.price >= 2_000_000 && property.price < 10_000_000;
        }
        if (filters.priceRange === "high") {
          matchesPrice = property.price >= 10_000_000;
        }
      } else {
        if (filters.priceRange === "low") {
          matchesPrice = property.price < 10_000;
        }
        if (filters.priceRange === "mid") {
          matchesPrice = property.price >= 10_000 && property.price < 25_000;
        }
        if (filters.priceRange === "high") {
          matchesPrice = property.price >= 25_000;
        }
      }

      return (
        matchesListingType &&
        matchesArea &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesPropertyType &&
        matchesFurnished &&
        matchesPrice
      );
    });
  }, [filters, initialArea, properties, type]);

  const exactLocationProperties = useMemo(() => {
    const normalizedLocation =
      appliedSearchIntent.cleanedQuery || appliedSearchIntent.normalizedQuery;

    if (!normalizedLocation) {
      return baseFilteredProperties.filter((property) =>
        matchesShortcutIntent(property, appliedSearchIntent),
      );
    }

    return baseFilteredProperties.filter((property) =>
      matchesSearchQuery(property, appliedLocation),
    );
  }, [appliedLocation, appliedSearchIntent, baseFilteredProperties]);

  const hasNoSearchMatches = Boolean(
    appliedLocation.trim() && exactLocationProperties.length === 0,
  );

  const locationScopedProperties = useMemo(() => {
    if (!appliedLocation.trim()) {
      return baseFilteredProperties;
    }

    if (!hasNoSearchMatches) {
      return exactLocationProperties;
    }

    return [];
  }, [appliedLocation, baseFilteredProperties, exactLocationProperties, hasNoSearchMatches]);

  const usageScopedProperties = useMemo(() => {
    return sortPropertiesBySearchRelevance(
      locationScopedProperties.filter((property) => getPropertyUsage(property) === usage),
      appliedLocation,
      filters.sortBy as "price-desc" | "price-asc" | "beds-desc",
    );
  }, [appliedLocation, filters.sortBy, locationScopedProperties, usage]);

  const residentialFallbackProperties = useMemo(() => {
    return sortPropertiesBySearchRelevance(
      locationScopedProperties.filter(
        (property) => getPropertyUsage(property) === PROPERTY_USAGE_RESIDENTIAL,
      ),
      appliedLocation,
      filters.sortBy as "price-desc" | "price-asc" | "beds-desc",
    );
  }, [appliedLocation, filters.sortBy, locationScopedProperties]);

  const showingResidentialFallback =
    usage === PROPERTY_USAGE_COMMERCIAL &&
    !appliedLocation.trim() &&
    usageScopedProperties.length === 0 &&
    residentialFallbackProperties.length > 0;

  const filteredProperties = useMemo(
    () =>
      applyDrawnMapFilters(
        showingResidentialFallback
          ? residentialFallbackProperties
          : usageScopedProperties,
        drawnItems,
      ),
    [drawnItems, residentialFallbackProperties, showingResidentialFallback, usageScopedProperties],
  );
  const activeLocation = appliedLocation;
  const activeUsage = showingResidentialFallback ? PROPERTY_USAGE_RESIDENTIAL : usage;
  const availablePropertyTypes = useMemo(
    () =>
      buildPropertyTypeOptions({
        propertyTypes,
        usage: activeUsage,
        fallbackLabels: properties
          .filter((property) => getPropertyUsage(property) === activeUsage)
          .map((property) => property.type),
      }),
    [activeUsage, properties, propertyTypes],
  );
  const didYouMeanLocations = useMemo(
    () =>
      hasNoSearchMatches
        ? getLocationAlternatives(appliedSearchIntent.cleanedQuery, locationPool)
        : [],
    [appliedSearchIntent.cleanedQuery, hasNoSearchMatches, locationPool],
  );
  const fallbackDisplayProperties = useMemo(() => {
    return sortPropertiesForDiscovery(
      properties,
      filters.sortBy as "price-desc" | "price-asc" | "beds-desc",
    );
  }, [filters.sortBy, properties]);
  const displayProperties =
    filteredProperties.length > 0 ? filteredProperties : fallbackDisplayProperties;
  const isShowingFallbackListings =
    filteredProperties.length === 0 && fallbackDisplayProperties.length > 0;
  const fallbackContextLabel = [
    activeLocation ? `"${activeLocation}"` : null,
    type ? `${LISTING_TYPE_META[type].label.toLowerCase()} listings` : null,
    usage !== PROPERTY_USAGE_RESIDENTIAL
      ? PROPERTY_USAGE_META[usage].label.toLowerCase()
      : null,
  ]
    .filter(Boolean)
    .join(" ");
  const displayedUsage =
    displayProperties[0] ? getPropertyUsage(displayProperties[0]) : activeUsage;
  const activeFilterCount = [
    filters.priceRange !== DEFAULT_FILTERS.priceRange,
    filters.bedrooms !== DEFAULT_FILTERS.bedrooms,
    filters.bathrooms !== DEFAULT_FILTERS.bathrooms,
    filters.propertyType !== DEFAULT_FILTERS.propertyType,
    filters.furnished !== DEFAULT_FILTERS.furnished,
    usage !== PROPERTY_USAGE_RESIDENTIAL,
  ].filter(Boolean).length;
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];

    if (activeLocation) {
      chips.push({
        key: "location",
        label: hasShortcutIntent(appliedSearchIntent)
          ? `Search: ${activeLocation}`
          : `In ${activeLocation}`,
      });
    }

    if (usage !== PROPERTY_USAGE_RESIDENTIAL) {
      chips.push({
        key: "usage",
        label: PROPERTY_USAGE_META[usage].label,
      });
    }

    if (filters.propertyType !== DEFAULT_FILTERS.propertyType) {
      chips.push({
        key: "property-type",
        label: filters.propertyType,
      });
    }

    if (filters.bathrooms !== DEFAULT_FILTERS.bathrooms) {
      chips.push({
        key: "bathrooms",
        label: formatBathroomsLabel(filters.bathrooms),
      });
    }

    if (filters.priceRange !== DEFAULT_FILTERS.priceRange) {
      chips.push({
        key: "price-range",
        label: formatPriceRangeLabel(type, filters.priceRange),
      });
    }

    if (filters.bedrooms !== DEFAULT_FILTERS.bedrooms) {
      chips.push({
        key: "bedrooms",
        label: formatBedroomsLabel(filters.bedrooms),
      });
    }

    if (filters.furnished !== DEFAULT_FILTERS.furnished) {
      chips.push({
        key: "furnished",
        label: formatFurnishedLabel(filters.furnished),
      });
    }

    return chips;
  }, [
    activeLocation,
    appliedSearchIntent,
    filters.bathrooms,
    filters.bedrooms,
    filters.furnished,
    filters.priceRange,
    filters.propertyType,
    type,
    usage,
  ]);
  const pageEyebrow = headerEyebrow ?? "Qatar Real Estate";
  const pageTitle =
    headerTitle ??
    `${displayProperties.length} ${PROPERTY_USAGE_META[displayedUsage].label} Properties${type ? ` for ${LISTING_TYPE_META[type].label.toUpperCase()}` : ""}${activeLocation ? ` in ${activeLocation}` : ""}`;
  const pageSubtitle = headerTitle
    ? `${displayProperties.length} listings currently available${activeLocation ? ` around ${activeLocation}` : ""}.`
    : headerDescription;

  useEffect(() => {
    if (!displayProperties.length) {
      setActiveId(null);
      return;
    }

    if (activeId && !displayProperties.some((property) => property.id === activeId)) {
      setActiveId(null);
    }
  }, [activeId, displayProperties]);

  useEffect(() => {
    if (
      filters.propertyType !== DEFAULT_FILTERS.propertyType &&
      !availablePropertyTypes.includes(filters.propertyType)
    ) {
      setFilters((current) => ({
        ...current,
        propertyType: DEFAULT_FILTERS.propertyType,
      }));
    }
  }, [availablePropertyTypes, filters.propertyType]);

  function activateProperty(
    id: number,
    options?: { scrollList?: boolean; forceScroll?: boolean },
  ) {
    setActiveId(id);
    setMapFocusMode("active");

    if (typeof window !== "undefined") {
      const nextUrl = `${window.location.pathname}${window.location.search}#prop-${id}`;
      window.history.replaceState(null, "", nextUrl);
    }

    if (
      options?.scrollList === false ||
      (isMobileViewport() && !options?.forceScroll)
    ) {
      return;
    }

    const element = document.getElementById(`prop-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openMobileMap(mode: "active" | "bounds") {
    setMapFocusMode(mode);
    setShowMapMobile(true);
  }

  function activatePropertyFromCard(id: number) {
    if (isMobileViewport()) {
      activateProperty(id, { scrollList: false });
      openMobileMap("active");
      return;
    }

    activateProperty(id);
  }

  function activatePropertyFromMap(id: number) {
    if (isMobileViewport()) {
      activateProperty(id, { scrollList: false });
      openMobileMap("active");
      return;
    }

    activateProperty(id);
  }

  function syncListingUrl(
    nextType: Property["listingType"] | null,
    nextLocation: string,
    nextFilters: typeof filters,
    nextUsage: Property["usage"] = usage,
  ) {
    const nextUrl =
      urlSyncMode === "search-route"
        ? buildSearchPath({
            listingType: nextType,
            query: nextLocation || null,
            priceRange: nextFilters.priceRange,
            bedrooms: nextFilters.bedrooms,
            bathrooms: nextFilters.bathrooms,
            sortBy: nextFilters.sortBy,
            propertyType: nextFilters.propertyType,
            furnished: nextFilters.furnished,
            usage: nextUsage,
          })
        : urlSyncMode === "base-path"
          ? buildQueryPath(urlBasePath ?? `/${nextType}`, {
              query: nextLocation || null,
              priceRange: nextFilters.priceRange,
              bedrooms: nextFilters.bedrooms,
              bathrooms: nextFilters.bathrooms,
              sortBy: nextFilters.sortBy,
              propertyType: nextFilters.propertyType,
              furnished: nextFilters.furnished,
              usage: nextUsage,
            })
          : buildListingPath(nextType ?? LISTING_TYPES[0], {
              query: nextLocation || null,
              priceRange: nextFilters.priceRange,
              bedrooms: nextFilters.bedrooms,
              bathrooms: nextFilters.bathrooms,
              sortBy: nextFilters.sortBy,
              propertyType: nextFilters.propertyType,
              furnished: nextFilters.furnished,
              usage: nextUsage,
            });

    router.replace(nextUrl, {
      scroll: true,
    });
  }

  function handleSearch(location?: string) {
    const finalLocation = (location ?? searchQuery).trim();
    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    setAppliedLocation(finalLocation);
    setSearchQuery(finalLocation);
    setSelectedIndex(-1);
    setIsAutocompleteOpen(false);
    syncListingUrl(type, finalLocation, filters, usage);
  }

  function updateFilter(key: keyof typeof filters, value: string) {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setFilters(nextFilters);
    syncListingUrl(type, appliedLocation, nextFilters, usage);
  }

  function handleListingTypeChange(nextType: Property["listingType"] | null) {
    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    if (urlSyncMode === "base-path") {
      router.replace(
        buildSearchPath({
          listingType: nextType,
          query: appliedLocation || null,
          priceRange: filters.priceRange,
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          sortBy: filters.sortBy,
          propertyType: filters.propertyType,
          furnished: filters.furnished,
          usage,
        }),
        { scroll: true },
      );
      return;
    }

    syncListingUrl(nextType, appliedLocation, filters, usage);
  }

  function handleUsageChange(nextUsage: Property["usage"]) {
    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setUsage(nextUsage);
    const nextUsageTypes = buildPropertyTypeOptions({
      propertyTypes,
      usage: nextUsage,
      fallbackLabels: properties
        .filter((property) => getPropertyUsage(property) === nextUsage)
        .map((property) => property.type),
    });
    const nextFilters = nextUsageTypes.includes(filters.propertyType)
      ? filters
      : {
          ...filters,
          propertyType: "all",
        };

    setFilters(nextFilters);

    syncListingUrl(type, appliedLocation, nextFilters, nextUsage);
  }

  function clearAllFilters() {
    const nextFilters = {
      ...DEFAULT_FILTERS,
    };

    setActiveId(null);
    setMapFocusMode("bounds");
    listScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
    setSearchQuery("");
    setAppliedLocation("");
    setSelectedIndex(-1);
    setIsAutocompleteOpen(false);
    setUsage(PROPERTY_USAGE_RESIDENTIAL);
    setFilters(nextFilters);
    setDrawnItems([]);
    syncListingUrl(type, "", nextFilters, PROPERTY_USAGE_RESIDENTIAL);
  }

  function handleViewProperty(slug: string) {
    const currentSearch = searchParams.toString();
    const backHref = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
    router.push(`/properties/${slug}?from=${encodeURIComponent(backHref)}`);
    window.scrollTo(0, 0);
  }

  function scrollResultsToTop() {
    listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      setSelectedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : current,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      setSelectedIndex((current) => (current > -1 ? current - 1 : current));
      return;
    }

    if (event.key === "Enter") {
      if (selectedIndex >= 0) {
        handleSearch(suggestions[selectedIndex]?.value);
        return;
      }

      handleSearch();
      return;
    }

    if (event.key === "Escape") {
      setIsAutocompleteOpen(false);
      setSelectedIndex(-1);
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white lg:h-screen lg:overflow-hidden">
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-[100] border-b border-gray-100 bg-white/95 backdrop-blur-md",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 md:gap-6 md:px-6 md:py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="shrink-0 transition-opacity hover:opacity-70"
          >
            <BrandMark className="origin-left scale-[0.65] md:scale-100" />
          </button>

          <div className="hidden shrink-0 rounded-lg bg-gray-100 p-1 sm:flex">
            <button
              type="button"
              onClick={() => handleListingTypeChange(LISTING_TYPES[0])}
              className={cn(
                "rounded-md px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all md:px-6 md:py-2 md:text-[10px]",
                type === LISTING_TYPES[0]
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400",
              )}
            >
              {LISTING_TYPE_META[LISTING_TYPES[0]].label.toUpperCase()}
            </button>
            <button
              type="button"
              onClick={() => handleListingTypeChange(LISTING_TYPES[1])}
              className={cn(
                "rounded-md px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-all md:px-6 md:py-2 md:text-[10px]",
                type === LISTING_TYPES[1]
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400",
              )}
            >
              {LISTING_TYPE_META[LISTING_TYPES[1]].label.toUpperCase()}
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-gray-400 md:left-4 md:h-4 md:w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsAutocompleteOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (suggestions.length > 0 || searchQuery.trim().length > 0) {
                  setIsAutocompleteOpen(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setIsAutocompleteOpen(false);
                  setSelectedIndex(-1);
                }, 120);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search The Pearl, Lusail, 2BHK, penthouse..."
              className="w-full rounded-full border-none bg-gray-50 py-2 pr-12 pl-9 text-sm font-medium text-black outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-accent/20 md:py-2.5 md:pl-12 md:text-[15px]"
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent/90 md:h-8 md:w-8"
            >
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
            </button>

            {isAutocompleteOpen && suggestions.length > 0 ? (
              <div className="absolute top-full right-0 left-0 z-[110] mt-2 max-h-[300px] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.value}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSearch(suggestion.value)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full items-center justify-between border-b border-gray-50 px-4 py-3 text-left transition-all last:border-none",
                      selectedIndex === index ? "bg-accent text-white" : "hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        className={cn(
                          "h-3 w-3",
                          selectedIndex === index ? "text-white" : "text-accent",
                        )}
                      />
                      <div>
                        <span className="text-sm font-semibold md:text-[15px]">
                          {suggestion.label}
                        </span>
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] font-medium tracking-[0.12em] uppercase",
                            selectedIndex === index
                              ? "text-white/80"
                              : "text-gray-500",
                          )}
                        >
                          {suggestion.category}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all md:px-3.5",
              showFilters
                ? "border-black bg-black text-white shadow-sm"
                : "border-gray-200 bg-white text-black hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? "Hide" : "Filters"}
            {activeFilterCount > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
                  showFilters ? "bg-white/15 text-white" : "bg-black text-white",
                )}
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters ? (
          <div className="border-t border-gray-100 bg-white/90 px-4 py-2.5 md:px-6 md:py-3">
            <div className="rounded-[22px] border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 px-3 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] md:px-3.5 md:py-3.5">
              <div className="mb-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase">
                      More Filters
                    </p>
                    <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-accent uppercase">
                      {activeFilterCount} active
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Refine by type, category, price, rooms, and furnishing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 self-start">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-gray-600 uppercase transition-colors hover:border-black hover:text-black"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-black uppercase transition-colors hover:border-black"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Hide Filters
                  </button>
                </div>
              </div>

              {activeFilterChips.length > 0 ? (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-bold tracking-[0.16em] text-gray-600 uppercase"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
                <FilterSelectField
                  label="Main Type"
                  value={usage}
                  onChange={(value) => handleUsageChange(value as Property["usage"])}
                >
                  {PROPERTY_USAGES.map((usageOption) => (
                    <option key={usageOption} value={usageOption}>
                      {PROPERTY_USAGE_META[usageOption].label}
                    </option>
                  ))}
                </FilterSelectField>

                <FilterSelectField
                  label="Category"
                  value={filters.propertyType}
                  onChange={(value) => updateFilter("propertyType", value)}
                >
                  <option value="all">All Categories</option>
                  {availablePropertyTypes.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {propertyType}
                    </option>
                  ))}
                </FilterSelectField>

                <FilterSelectField
                  label="Price"
                  value={filters.priceRange}
                  onChange={(value) => updateFilter("priceRange", value)}
                >
                  <option value="all">All Prices</option>
                  <option value="low">
                    {type
                      ? type === LISTING_TYPES[0]
                        ? "Under 2M QAR"
                        : "Under 10K QAR"
                      : "Lower Price"}
                  </option>
                  <option value="mid">
                    {type
                      ? type === LISTING_TYPES[0]
                        ? "2M - 10M QAR"
                        : "10K - 25K QAR"
                      : "Mid Price"}
                  </option>
                  <option value="high">
                    {type
                      ? type === LISTING_TYPES[0]
                        ? "10M+ QAR"
                        : "25K+ QAR"
                      : "Premium Price"}
                  </option>
                </FilterSelectField>

                <FilterSelectField
                  label="Bedrooms"
                  value={filters.bedrooms}
                  onChange={(value) => updateFilter("bedrooms", value)}
                >
                  <option value="all">Any Bedrooms</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </FilterSelectField>

                <FilterSelectField
                  label="Bathrooms"
                  value={filters.bathrooms}
                  onChange={(value) => updateFilter("bathrooms", value)}
                >
                  <option value="all">Any Bathrooms</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </FilterSelectField>

                <FilterSelectField
                  label="Furnishing"
                  value={filters.furnished}
                  onChange={(value) => updateFilter("furnished", value)}
                >
                  <option value="all">Any Furnishing</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </FilterSelectField>

                <div className="rounded-2xl border border-dashed border-accent/30 bg-accent/[0.04] px-3 py-2.5 text-[10px] leading-relaxed text-gray-500 md:col-span-2 xl:col-span-6">
                  <div className="flex items-start gap-2.5">
                    <MapIcon className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                    <p>Draw on the map to narrow results inside a custom area.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
        <div
          ref={listScrollRef}
          className={cn(
            "scroll-smooth bg-gray-50/30 transition-all duration-500",
            viewMode === "grid" ? "px-3 pt-2 pb-3 md:px-4 md:pt-3 md:pb-4" : "px-4 pt-3 pb-4 md:px-6 md:pt-4 md:pb-6",
            showMapMobile ? "hidden lg:block" : "block",
            "w-full overflow-visible lg:w-[50%] lg:overflow-y-auto xl:w-[55%]",
          )}
        >
          <div
            className={cn(
              "mx-auto transition-all duration-500",
              viewMode === "grid" ? "max-w-none" : "max-w-3xl",
            )}
          >
            <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1.5 text-[10px] font-bold tracking-[0.3em] text-accent uppercase"
                >
                  {pageEyebrow}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-2xl font-bold text-black md:text-3xl"
                >
                  {pageTitle}
                </motion.p>
                {pageSubtitle ? (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500"
                  >
                    {pageSubtitle}
                  </motion.p>
                ) : null}
                {hasNoSearchMatches ? (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.17 }}
                    className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-medium text-amber-900"
                  >
                    No exact matches for &quot;{activeLocation}&quot;. Try a nearby area or explore current listings below.
                  </motion.p>
                ) : null}
                {showingResidentialFallback ? (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.19 }}
                    className="mt-2 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-[11px] font-medium text-teal-900"
                  >
                    No commercial listings matched this search, so the page jumped to residential results.
                  </motion.p>
                ) : null}
                {headerDescription && headerTitle ? (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500"
                  >
                    {headerDescription}
                  </motion.p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase"
                    >
                      {chip.label}
                    </span>
                  ))}
                  {activeFilterChips.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-black uppercase transition-colors hover:border-black"
                    >
                      Clear All
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2.5 md:justify-end md:gap-4">
                <div className="flex items-center rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-md p-1.5 transition-all",
                      viewMode === "list"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-md p-1.5 transition-all",
                      viewMode === "grid"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-400 hover:text-gray-600",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Sort by:
                </span>
                <select
                  className="cursor-pointer border-b border-gray-200 bg-transparent pb-1 text-[10px] font-bold tracking-widest text-black uppercase transition-colors hover:text-accent focus:outline-none"
                  value={filters.sortBy}
                  onChange={(event) => updateFilter("sortBy", event.target.value)}
                >
                  <option value="price-desc">Highest Price</option>
                  <option value="price-asc">Lowest Price</option>
                  <option value="beds-desc">Most Bedrooms</option>
                </select>
              </div>
            </div>

            {didYouMeanLocations.length > 0 ? (
              <div className="mb-4 space-y-3 md:mb-5">
                {didYouMeanLocations.length > 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-[10px] font-bold tracking-[0.24em] text-amber-900 uppercase">
                      Did You Mean?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {didYouMeanLocations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => handleSearch(location)}
                          className="rounded-full border border-amber-300 bg-white px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-amber-900 uppercase transition-all hover:border-amber-500 hover:bg-amber-100"
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {isShowingFallbackListings ? (
              <div className="mb-4 rounded-3xl border border-gray-200 bg-white px-5 py-3.5 md:mb-5">
                <p className="text-[10px] font-bold tracking-[0.24em] text-gray-500 uppercase">
                  Showing Best Available Listings
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  No exact matches were found
                  {fallbackContextLabel ? ` for ${fallbackContextLabel}` : " for this search"},
                  so the list below shows all available listings with the strongest
                  current options first.
                </p>
              </div>
            ) : null}

            <div
              className={cn(
                "grid gap-4 md:gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {displayProperties.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center">
                  <p className="text-base font-semibold text-black">
                    No listings match this search yet.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Try a nearby area, clear the filters, or switch between buy and rent to see more options.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {didYouMeanLocations.map((location) => (
                      <button
                        key={`empty-${location}`}
                        type="button"
                        onClick={() => handleSearch(location)}
                        className="rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-black uppercase transition-all hover:border-accent hover:bg-accent hover:text-white"
                      >
                        {location}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="rounded-full bg-black px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-accent"
                    >
                      {type
                        ? `Show All ${LISTING_TYPE_META[type].label} Listings`
                        : "Show All Listings"}
                    </button>
                  </div>
                </div>
              ) : null}
              {displayProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  id={`prop-${property.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-500",
                    viewMode === "list" ? "sm:flex-row" : "flex-col",
                    activeId === property.id
                      ? "border-accent shadow-2xl shadow-accent/10 ring-1 ring-accent/20"
                      : "border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50",
                  )}
                  onClick={() => activatePropertyFromCard(property.id)}
                >
                  <div
                    className={cn(
                      "relative shrink-0 overflow-hidden",
                      viewMode === "list"
                        ? "aspect-[4/3] w-full sm:w-[40%] sm:aspect-auto"
                        : "aspect-[4/3] w-full",
                    )}
                  >
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="rounded-full bg-white/90 px-3 py-1 text-[8px] font-bold tracking-widest text-black uppercase shadow-sm backdrop-blur-md">
                        {property.type}
                      </div>
                      <div className="rounded-full bg-black/75 px-3 py-1 text-[8px] font-bold tracking-widest text-white uppercase shadow-sm backdrop-blur-md">
                        ID {formatPropertyReference(property.id)}
                      </div>
                      {property.badges.includes("LUXURY") ? (
                        <div className="rounded-full bg-black px-3 py-1 text-[8px] font-bold tracking-widest text-white uppercase shadow-sm">
                          Luxury
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex flex-1 flex-col justify-between",
                      viewMode === "list" ? "p-6 md:p-8" : "p-5 md:p-5",
                    )}
                  >
                    <div>
                      <div
                        className={cn(
                          "mb-3 flex items-start justify-between",
                          viewMode === "grid" ? "flex-col gap-2" : "flex-row",
                        )}
                      >
                        <div>
                          <h3
                            className={cn(
                              "mb-1 font-bold leading-snug text-black transition-colors group-hover:text-accent",
                              viewMode === "list"
                                ? "text-lg"
                                : "min-h-[3.5rem] text-[1.05rem] line-clamp-2",
                            )}
                          >
                            {property.title}
                          </h3>
                          <p className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <MapPin className="h-3 w-3 text-accent" />
                            <span className={cn(viewMode === "grid" ? "line-clamp-1" : "")}>
                              {property.location}
                            </span>
                          </p>
                        </div>
                        <div
                          className={cn(
                            viewMode === "grid"
                              ? "mt-0.5 rounded-2xl bg-gray-50 px-3 py-2 text-left"
                              : "text-right",
                          )}
                        >
                          <div
                            className={cn(
                              "font-display font-bold text-black",
                              viewMode === "list" ? "text-xl" : "text-[1.15rem]",
                            )}
                          >
                            QAR {formatPrice(property.price)}
                          </div>
                          <div className="mt-0.5 text-[8px] font-bold tracking-widest text-gray-400 uppercase">
                            {property.listingType === LISTING_TYPES[1] ? "/ Month" : "Total Price"}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "mb-4 border-y border-gray-100 py-3",
                          viewMode === "list"
                            ? "flex items-center gap-6"
                            : "grid grid-cols-3 gap-2",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            viewMode === "grid" ? "rounded-2xl bg-gray-50 px-2.5 py-2" : "",
                          )}
                        >
                          <Bed className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] font-bold leading-none">
                            {property.beds}{" "}
                            <span className="font-normal text-gray-400">Beds</span>
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            viewMode === "grid" ? "rounded-2xl bg-gray-50 px-2.5 py-2" : "",
                          )}
                        >
                          <Bath className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] font-bold leading-none">
                            {property.baths}{" "}
                            <span className="font-normal text-gray-400">Baths</span>
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            viewMode === "grid" ? "rounded-2xl bg-gray-50 px-2.5 py-2" : "",
                          )}
                        >
                          <MapIcon className="h-3.5 w-3.5 text-accent" />
                          <span className="text-[10px] font-bold leading-none">
                            {extractSqftValue(property.sqft)}{" "}
                            <span className="font-normal text-gray-400">sqft</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            activateProperty(property.id, { scrollList: false });
                            openMobileMap("active");
                          }}
                          className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[8px] font-bold tracking-widest uppercase transition-colors hover:bg-gray-200 lg:hidden"
                        >
                          <MapIcon className="h-2.5 w-2.5" />
                          Map
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleViewProperty(property.slug);
                          }}
                          className={cn(
                            "group/btn inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black text-[8px] font-bold tracking-widest text-white uppercase transition-all hover:bg-accent",
                            viewMode === "list" ? "px-5 py-2" : "px-4 py-2",
                          )}
                        >
                          View
                          <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative z-0 w-full bg-white transition-all duration-700 ease-in-out lg:w-[50%] xl:w-[45%]",
            showMapMobile
              ? "fixed inset-x-0 bottom-0 z-[90] opacity-100 lg:relative lg:inset-auto lg:z-0"
              : mobileMapPrimed
                ? "pointer-events-none fixed inset-x-0 bottom-0 -z-10 translate-y-8 opacity-0 lg:pointer-events-auto lg:relative lg:inset-auto lg:z-0 lg:translate-y-0 lg:opacity-100"
                : "hidden lg:block",
          )}
          style={showMapMobile || mobileMapPrimed ? { top: mobileMapOffset } : undefined}
        >
          <PropertyListingMap
            properties={displayProperties}
            activeId={activeId}
            focusMode={showMapMobile ? mapFocusMode : activeId ? "active" : "bounds"}
            isVisible={showMapMobile || mobileMapPrimed || !isMobileViewport()}
            drawnItems={drawnItems}
            onActivateProperty={activatePropertyFromMap}
            onDrawnItemsChange={setDrawnItems}
            onViewProperty={handleViewProperty}
          />

          {showMapMobile ? (
            <button
              type="button"
              onClick={() => setShowMapMobile(false)}
              className="absolute bottom-10 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-black px-8 py-4 text-[10px] font-bold tracking-widest text-white uppercase shadow-2xl lg:hidden"
            >
              <List className="h-4 w-4" />
              Back to List
            </button>
          ) : null}
        </div>

        {!showMapMobile ? (
          <button
            type="button"
            onClick={() => openMobileMap("bounds")}
            className="fixed bottom-10 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-black px-8 py-4 text-[10px] font-bold tracking-widest text-white uppercase shadow-2xl lg:hidden"
          >
            <MapIcon className="h-4 w-4" />
            View Map
          </button>
        ) : null}
      </div>

      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollResultsToTop}
          className="fixed right-4 bottom-24 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition-all hover:bg-accent lg:right-6 lg:bottom-8"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
