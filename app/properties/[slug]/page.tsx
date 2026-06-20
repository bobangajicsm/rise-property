import { notFound } from "next/navigation";
import { PropertyDetailPage } from "@/components/detail/property-detail-page";
import {
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/properties-store";
import {
  breadcrumbJsonLd,
  propertyJsonLd,
  propertyMetadata,
} from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/properties/[slug]">,
) {
  const { slug } = await props.params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found",
    };
  }

  return propertyMetadata(property);
}

export default async function PropertyPage(
  props: PageProps<"/properties/[slug]">,
) {
  const { slug } = await props.params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const relatedProperties = await getRelatedProperties(property, 10);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      {
        name: property.listingType === "buy" ? "Buy" : "Rent",
        path: `/${property.listingType}`,
      },
      {
        name: property.title,
        path: `/properties/${property.slug}`,
      },
    ]),
    propertyJsonLd(property),
  ];

  return (
    <>
      <PropertyDetailPage
        property={property}
        relatedProperties={relatedProperties}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
