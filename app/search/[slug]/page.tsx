import { notFound } from "next/navigation";
import { PropertyListingPage } from "@/components/listing/property-listing-page";
import {
  SEO_SEARCH_PAGES,
  buildSeoSearchPath,
  filterPropertiesForSeoPageWithFallback,
  getSeoSearchDefaults,
  getSeoSearchPageBySlug,
} from "@/data/seo-search-pages";
import {
  breadcrumbJsonLd,
  customCollectionJsonLd,
  customCollectionMetadata,
} from "@/lib/seo";
import { getPropertyTypeConfigurations } from "@/lib/property-types-store";
import { getAllProperties } from "@/lib/properties-store";
import { normalizePropertyUsage } from "@/types/property";

export async function generateStaticParams() {
  return SEO_SEARCH_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<"/search/[slug]">,
) {
  const params = await props.params;
  const page = getSeoSearchPageBySlug(params.slug);

  if (!page) {
    return {};
  }

  return customCollectionMetadata({
    title: page.title,
    description: page.description,
    path: buildSeoSearchPath(page.slug),
  });
}

export default async function SeoSearchPage(props: PageProps<"/search/[slug]">) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const page = getSeoSearchPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  const defaults = getSeoSearchDefaults(page);
  const initialQuery =
    typeof searchParams.q === "string"
      ? searchParams.q
      : defaults.query;
  const initialPriceRange =
    typeof searchParams.price === "string" ? searchParams.price : null;
  const initialBedrooms =
    typeof searchParams.beds === "string"
      ? searchParams.beds
      : defaults.bedrooms;
  const initialBathrooms =
    typeof searchParams.baths === "string" ? searchParams.baths : null;
  const initialSortBy =
    typeof searchParams.sort === "string" ? searchParams.sort : null;
  const initialPropertyType =
    typeof searchParams.propertyType === "string"
      ? searchParams.propertyType
      : defaults.propertyType;
  const initialFurnished =
    typeof searchParams.furnished === "string" ? searchParams.furnished : null;
  const initialUsage =
    normalizePropertyUsage(
      typeof searchParams.usage === "string" ? searchParams.usage : defaults.usage,
    );
  const [allProperties, propertyTypes] = await Promise.all([
    getAllProperties(),
    getPropertyTypeConfigurations(),
  ]);
  const properties = filterPropertiesForSeoPageWithFallback(allProperties, page);
  const path = buildSeoSearchPath(page.slug);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      {
        name: page.listingType === "buy" ? "Buy" : "Rent",
        path: page.listingType === "buy" ? "/buy" : "/rent",
      },
      { name: page.title, path },
    ]),
    customCollectionJsonLd({
      title: page.title,
      description: page.description,
      path,
      properties,
    }),
  ];

  return (
    <>
      <PropertyListingPage
        properties={properties}
        type={page.listingType}
        initialQuery={initialQuery}
        initialPriceRange={initialPriceRange}
        initialBedrooms={initialBedrooms}
        initialBathrooms={initialBathrooms}
        initialSortBy={initialSortBy}
        initialPropertyType={initialPropertyType}
        initialFurnished={initialFurnished}
        initialUsage={initialUsage}
        propertyTypes={propertyTypes}
        urlSyncMode="base-path"
        urlBasePath={path}
        headerEyebrow="SEO Search Landing"
        headerTitle={page.title}
        headerDescription={page.description}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
