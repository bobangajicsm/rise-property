import { PropertyListingPage } from "@/components/listing/property-listing-page";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import {
  breadcrumbJsonLd,
  listingJsonLd,
  listingMetadata,
} from "@/lib/seo";
import { getPropertiesByListingType } from "@/lib/properties-store";
import { normalizePropertyUsage } from "@/types/property";

export const metadata = listingMetadata("buy");

export default async function BuyPage(props: PageProps<"/buy">) {
  const searchParams = await props.searchParams;
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
  const initialUsage = normalizePropertyUsage(
    typeof searchParams.usage === "string" ? searchParams.usage : null,
  );
  const [properties, propertyTypes] = await Promise.all([
    getPropertiesByListingType("buy"),
    getPropertyTypeConfigurations(),
  ]);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Buy", path: "/buy" },
    ]),
    listingJsonLd("buy", properties),
  ];

  return (
    <>
      <PropertyListingPage
        properties={properties}
        type="buy"
        initialQuery={initialQuery}
        initialPriceRange={initialPriceRange}
        initialBedrooms={initialBedrooms}
        initialBathrooms={initialBathrooms}
        initialSortBy={initialSortBy}
        initialPropertyType={initialPropertyType}
        initialFurnished={initialFurnished}
        initialUsage={initialUsage}
        propertyTypes={propertyTypes}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
