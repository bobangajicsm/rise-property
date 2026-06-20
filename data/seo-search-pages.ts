import type { Property } from "@/types/property";

export interface SeoSearchPage {
  slug: string;
  label: string;
  title: string;
  description: string;
  listingType: Property["listingType"];
  searchLabel?: string;
  locationMatches?: string[];
  propertyTypes?: string[];
  variant?: "studio" | "townhouse" | "commercial";
}

export const SEO_SEARCH_PAGES: SeoSearchPage[] = [
  {
    slug: "properties-for-rent-in-qatar",
    label: "Properties for rent in Qatar",
    title: "Properties for Rent in Qatar",
    description:
      "Browse premium rental properties across Qatar, including apartments, villas, penthouses, and investment-ready homes in leading districts.",
    listingType: "rent",
  },
  {
    slug: "properties-for-sale-in-qatar",
    label: "Properties for sale in Qatar",
    title: "Properties for Sale in Qatar",
    description:
      "Explore curated homes and investment opportunities for sale across Qatar, from waterfront apartments to high-end villas and penthouses.",
    listingType: "buy",
  },
  {
    slug: "apartments-for-rent-in-qatar",
    label: "Apartments for rent in Qatar",
    title: "Apartments for Rent in Qatar",
    description:
      "Discover apartments for rent in Qatar with curated finishes, central locations, and lifestyle-focused amenities.",
    listingType: "rent",
    propertyTypes: ["Apartment"],
  },
  {
    slug: "villas-for-rent-in-qatar",
    label: "Villas for rent in Qatar",
    title: "Villas for Rent in Qatar",
    description:
      "Browse villas for rent in Qatar, including spacious family homes and premium private residences in sought-after neighborhoods.",
    listingType: "rent",
    propertyTypes: ["Villa"],
  },
  {
    slug: "studios-for-rent-in-qatar",
    label: "Studios for rent in Qatar",
    title: "Studios for Rent in Qatar",
    description:
      "Explore studio rentals in Qatar for flexible city living, from elegant compact apartments to turnkey furnished options.",
    listingType: "rent",
    variant: "studio",
  },
  {
    slug: "properties-for-rent-in-the-pearl",
    label: "Properties for rent in The Pearl",
    title: "Properties for Rent in The Pearl",
    description:
      "Browse premium rental listings in The Pearl, including apartments, penthouses, and waterfront residences with standout views.",
    listingType: "rent",
    searchLabel: "The Pearl",
    locationMatches: ["The Pearl"],
  },
  {
    slug: "properties-for-rent-in-west-bay",
    label: "Properties for rent in West Bay",
    title: "Properties for Rent in West Bay",
    description:
      "Discover curated rental properties in West Bay, close to Doha's corporate core, hotels, and premium lifestyle destinations.",
    listingType: "rent",
    searchLabel: "West Bay",
    locationMatches: ["West Bay"],
  },
  {
    slug: "properties-for-rent-in-lusail",
    label: "Properties for rent in Lusail",
    title: "Properties for Rent in Lusail",
    description:
      "Explore rental opportunities in Lusail, from modern apartments to premium residences in one of Qatar's fastest-growing districts.",
    listingType: "rent",
    searchLabel: "Lusail",
    locationMatches: ["Lusail"],
  },
  {
    slug: "properties-for-sale-in-the-pearl",
    label: "Properties for sale in The Pearl",
    title: "Properties for Sale in The Pearl",
    description:
      "See exclusive homes and investment opportunities for sale in The Pearl, including luxury apartments and signature waterfront properties.",
    listingType: "buy",
    searchLabel: "The Pearl",
    locationMatches: ["The Pearl"],
  },
  {
    slug: "properties-for-sale-in-lusail",
    label: "Properties for sale in Lusail",
    title: "Properties for Sale in Lusail",
    description:
      "Browse properties for sale in Lusail, including design-led residences and growth-focused investment opportunities.",
    listingType: "buy",
    searchLabel: "Lusail",
    locationMatches: ["Lusail"],
  },
  {
    slug: "apartments-for-sale-in-lusail",
    label: "Apartments for sale in Lusail",
    title: "Apartments for Sale in Lusail",
    description:
      "Explore apartments for sale in Lusail with strong investment appeal, premium amenities, and high-spec contemporary layouts.",
    listingType: "buy",
    searchLabel: "Lusail",
    locationMatches: ["Lusail"],
    propertyTypes: ["Apartment"],
  },
  {
    slug: "properties-for-rent-in-al-dafna",
    label: "Properties for rent in Al Dafna",
    title: "Properties for Rent in Al Dafna",
    description:
      "Browse curated rental listings relevant to Al Dafna and the surrounding West Bay corridor, with premium residential options near Doha's business district.",
    listingType: "rent",
    searchLabel: "Al Dafna",
    locationMatches: ["Al Dafna", "West Bay"],
  },
  {
    slug: "villas-for-sale-in-west-bay-lagoon",
    label: "Villas for sale in West Bay Lagoon",
    title: "Villas for Sale in West Bay Lagoon",
    description:
      "Discover private villas for sale in West Bay Lagoon with spacious layouts, family-friendly settings, and high-end finishes.",
    listingType: "buy",
    searchLabel: "West Bay Lagoon",
    locationMatches: ["West Bay Lagoon"],
    propertyTypes: ["Villa"],
  },
  {
    slug: "properties-for-rent-in-msheireb",
    label: "Properties for rent in Msheireb",
    title: "Properties for Rent in Msheireb",
    description:
      "Explore rental properties relevant to Msheireb and central Doha living, with curated options for clients seeking an urban premium address.",
    listingType: "rent",
    searchLabel: "Msheireb",
    locationMatches: ["Msheireb", "Mushaireb", "West Bay"],
  },
  {
    slug: "offices-for-rent-in-west-bay",
    label: "Offices for rent in West Bay",
    title: "Offices for Rent in West Bay",
    description:
      "Browse premium office listings for rent in West Bay, suited to businesses looking for a strong address in Doha's commercial core.",
    listingType: "rent",
    searchLabel: "West Bay",
    locationMatches: ["West Bay"],
    propertyTypes: ["Office"],
  },
  {
    slug: "offices-for-rent-in-qatar",
    label: "Offices for rent in Qatar",
    title: "Offices for Rent in Qatar",
    description:
      "Discover office space for rent across Qatar, including premium suites and business-ready commercial units in key districts.",
    listingType: "rent",
    propertyTypes: ["Office"],
  },
  {
    slug: "villas-for-sale-in-qatar",
    label: "Villas for sale in Qatar",
    title: "Villas for Sale in Qatar",
    description:
      "Explore curated villas for sale in Qatar, from contemporary family homes to high-value private residences.",
    listingType: "buy",
    propertyTypes: ["Villa"],
  },
  {
    slug: "townhouses-for-rent-in-qatar",
    label: "Townhouses for rent in Qatar",
    title: "Townhouses for Rent in Qatar",
    description:
      "Browse townhouse-style rental properties in Qatar, tailored for clients seeking multi-level homes with strong family appeal.",
    listingType: "rent",
    variant: "townhouse",
  },
  {
    slug: "commercial-for-rent-in-qatar",
    label: "Commercial for rent in Qatar",
    title: "Commercial Properties for Rent in Qatar",
    description:
      "See commercial rental opportunities across Qatar, including office-oriented spaces suited to premium business occupancy.",
    listingType: "rent",
    variant: "commercial",
  },
  {
    slug: "penthouses-for-rent-in-qatar",
    label: "Penthouses for rent in Qatar",
    title: "Penthouses for Rent in Qatar",
    description:
      "Explore penthouses for rent in Qatar with panoramic views, standout layouts, and elevated residential experiences.",
    listingType: "rent",
    propertyTypes: ["Penthouse"],
  },
];

export function buildSeoSearchPath(slug: string) {
  return `/search/${slug}`;
}

export function getSeoSearchPageBySlug(slug: string) {
  return SEO_SEARCH_PAGES.find((page) => page.slug === slug);
}

export function getSeoSearchPageByLabel(label: string) {
  return SEO_SEARCH_PAGES.find((page) => page.label === label);
}

export function getSeoSearchDefaults(page: SeoSearchPage) {
  const propertyType = page.propertyTypes?.[0] ?? (
    page.variant === "commercial"
      ? "Office"
      : page.variant === "townhouse"
        ? "Villa"
        : page.variant === "studio"
          ? "Apartment"
          : null
  );

  const bedrooms = page.variant === "studio" ? "1" : null;
  const usage =
    page.variant === "commercial" ||
    propertyType === "Office" ||
    propertyType === "Shop"
      ? "commercial"
      : "residential";

  return {
    listingType: page.listingType,
    query: page.searchLabel ?? page.locationMatches?.[0] ?? null,
    propertyType,
    bedrooms,
    usage,
  };
}

export function filterPropertiesForSeoPage(
  properties: Property[],
  page: SeoSearchPage,
) {
  return properties.filter((property) => {
    if (property.listingType !== page.listingType) {
      return false;
    }

    if (page.locationMatches?.length) {
      const haystack = `${property.location} ${property.area}`.toLowerCase();
      const matchesLocation = page.locationMatches.some((value) =>
        haystack.includes(value.toLowerCase()),
      );

      if (!matchesLocation) {
        return false;
      }
    }

    if (page.propertyTypes?.length && !page.propertyTypes.includes(property.type)) {
      return false;
    }

    if (page.variant === "studio") {
      return property.type === "Apartment" && property.beds <= 1;
    }

    if (page.variant === "townhouse") {
      return property.type === "Villa";
    }

    if (page.variant === "commercial") {
      return property.usage === "commercial";
    }

    return true;
  });
}

export function filterPropertiesForSeoPageWithFallback(
  properties: Property[],
  page: SeoSearchPage,
) {
  const exactMatches = filterPropertiesForSeoPage(properties, page);

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const locationFallback = properties.filter((property) => {
    if (property.listingType !== page.listingType) {
      return false;
    }

    if (!page.locationMatches?.length) {
      return true;
    }

    const haystack = `${property.location} ${property.area}`.toLowerCase();
    return page.locationMatches.some((value) =>
      haystack.includes(value.toLowerCase()),
    );
  });

  if (locationFallback.length > 0) {
    return locationFallback;
  }

  return properties.filter((property) => property.listingType === page.listingType);
}
