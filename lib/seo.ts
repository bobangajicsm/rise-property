import type { Metadata } from "next";
import {
  absoluteUrl,
  siteDescription,
  siteEmail,
  siteName,
  sitePhone,
} from "@/lib/site";
import { extractSqftValue } from "@/lib/property-formatting";
import { LISTING_TYPE_META, type Property } from "@/types/property";

function baseMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: images?.map((image) => ({
        url: image,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export function homeMetadata(): Metadata {
  return baseMetadata({
    title: `${siteName} | Luxury Real Estate in Qatar`,
    description: siteDescription,
    path: "/",
    images: [
      "https://images.unsplash.com/photo-1580674239581-3fbc1b42911a?auto=format&fit=crop&q=80&w=1200",
    ],
  });
}

export function listingMetadata(type: Property["listingType"]): Metadata {
  const label = LISTING_TYPE_META[type].label;

  return baseMetadata({
    title: `${label} Properties in Qatar | ${siteName}`,
    description:
      type === "buy"
        ? "Browse luxury homes, villas, apartments, and investment opportunities for sale across Qatar."
        : "Browse premium apartments, villas, and penthouses for rent across Qatar.",
    path: `/${type}`,
  });
}

export function customCollectionMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return baseMetadata({
    title: `${title} | ${siteName}`,
    description,
    path,
  });
}

export function propertyMetadata(property: Property): Metadata {
  return baseMetadata({
    title: `${property.title} | ${siteName}`,
    description: property.description,
    path: `/properties/${property.slug}`,
    images: property.images,
  });
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: siteName,
    url: absoluteUrl("/"),
    areaServed: "Qatar",
    telephone: sitePhone,
    email: siteEmail,
    description: siteDescription,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function listingJsonLd(
  type: Property["listingType"],
  properties: Property[],
) {
  const label = LISTING_TYPE_META[type].label;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} Properties in Qatar`,
    description:
      type === "buy"
        ? "Luxury properties for sale across Qatar."
        : "Luxury properties for rent across Qatar.",
    url: absoluteUrl(`/${type}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: properties.slice(0, 20).map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/properties/${property.slug}`),
        name: property.title,
      })),
    },
  };
}

export function customCollectionJsonLd({
  title,
  description,
  path,
  properties,
}: {
  title: string;
  description: string;
  path: string;
  properties: Property[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: properties.slice(0, 20).map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/properties/${property.slug}`),
        name: property.title,
      })),
    },
  };
}

export function propertyJsonLd(property: Property) {
  return {
    "@context": "https://schema.org",
    "@type":
      property.type === "Apartment"
        ? "Apartment"
        : property.type === "Villa"
          ? "House"
          : "Residence",
    name: property.title,
    description: property.description,
    image: property.images,
    url: absoluteUrl(`/properties/${property.slug}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.area,
      addressCountry: "QA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    numberOfRooms: property.beds,
    numberOfBathroomsTotal: property.baths,
    floorSize: {
      "@type": "QuantitativeValue",
      value: Number.parseInt(extractSqftValue(property.sqft).replace(/,/g, ""), 10),
      unitCode: "FTK",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "QAR",
      price: property.price,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/properties/${property.slug}`),
    },
    seller: {
      "@type": "RealEstateAgent",
      name: siteName,
      telephone: property.agent.phone,
    },
  };
}
