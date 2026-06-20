import { PropertyListingPage } from "@/components/listing/property-listing-page";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import { breadcrumbJsonLd, customCollectionMetadata } from "@/lib/seo";
import { getAllProperties } from "@/lib/properties-store";
import { LISTING_TYPES, normalizePropertyUsage } from "@/types/property";

export const metadata = customCollectionMetadata({
  title: "Search Properties in Qatar",
  description:
    "Search curated homes, rentals, villas, penthouses, and office listings across Qatar with flexible filters.",
  path: "/search",
});

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const listingParam =
    typeof searchParams.listing === "string" ? searchParams.listing : null;
  const initialQuery =
    typeof searchParams.q === "string" ? searchParams.q : null;
  const initialPriceRange =
    typeof searchParams.price === "string" ? searchParams.price : null;
  const initialBedrooms =
    typeof searchParams.beds === "string" ? searchParams.beds : null;
  const initialBathrooms =
    typeof searchParams.baths === "string" ? searchParams.baths : null;
  const initialSortBy =
    typeof searchParams.sort === "string" ? searchParams.sort : null;
  const initialPropertyType =
    typeof searchParams.propertyType === "string"
      ? searchParams.propertyType
      : null;
  const initialFurnished =
    typeof searchParams.furnished === "string" ? searchParams.furnished : null;
  const initialListingType =
    listingParam === LISTING_TYPES[0] ? LISTING_TYPES[0] : LISTING_TYPES[1];
  const initialUsage = normalizePropertyUsage(
    typeof searchParams.usage === "string" ? searchParams.usage : null,
  );
  const [properties, propertyTypes] = await Promise.all([
    getAllProperties(),
    getPropertyTypeConfigurations(),
  ]);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Search", path: "/search" },
    ]),
  ];

  return (
    <>
      <PropertyListingPage
        properties={properties}
        type={initialListingType}
        initialQuery={initialQuery}
        initialPriceRange={initialPriceRange}
        initialBedrooms={initialBedrooms}
        initialBathrooms={initialBathrooms}
        initialSortBy={initialSortBy}
        initialPropertyType={initialPropertyType}
        initialFurnished={initialFurnished}
        initialUsage={initialUsage}
        propertyTypes={propertyTypes}
        urlSyncMode="search-route"
        headerTitle="Search Properties in Qatar"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
