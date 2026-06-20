import { HomePage } from "@/components/home/home-page";
import { getPremiumAreaConfigurations } from "@/lib/featured-areas-store";
import { getAllProperties } from "@/lib/properties-store";
import {
  breadcrumbJsonLd,
  homeMetadata,
  organizationJsonLd,
} from "@/lib/seo";
import { absoluteUrl, siteName } from "@/lib/site";

export const metadata = homeMetadata();

export default async function Page() {
  const properties = await getAllProperties();
  const featuredAreas = await getPremiumAreaConfigurations();
  const jsonLd = [
    organizationJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
      potentialAction: {
      "@type": "SearchAction",
        target: `${absoluteUrl("/search")}?q={search_term_string}&listing=rent`,
        "query-input": "required name=search_term_string",
      },
    },
    breadcrumbJsonLd([{ name: "Home", path: "/" }]),
  ];

  return (
    <>
      <HomePage properties={properties} featuredAreas={featuredAreas} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
