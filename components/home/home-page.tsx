'use client';

import { useRouter } from "next/navigation";
import { ContactSection } from "@/components/contact/contact-section";
import { AmbitionSection } from "@/components/home/ambition-section";
import { FinalCTA } from "@/components/home/final-cta";
import { Footer } from "@/components/home/footer";
import { FullService } from "@/components/home/full-service";
import { Hero } from "@/components/home/hero";
import { Nav } from "@/components/home/nav";
import { PopularRealEstate } from "@/components/home/popular-real-estate";
import { RecommendedProperties } from "@/components/home/recommended-properties";
import { WhatsAppButton } from "@/components/home/whatsapp-button";
import { WhyRise } from "@/components/home/why-rise";
import { buildSearchPath } from "@/lib/site";
import type { FeaturedAreaConfig, Property } from "@/types/property";

interface HomePageProps {
  properties: Property[];
  featuredAreas: FeaturedAreaConfig[];
}

export function HomePage({ properties }: HomePageProps) {
  const router = useRouter();

  function handleNavigateToSearch(
    type: Property["listingType"],
    query?: string,
  ) {
    router.push(
      buildSearchPath({
        listingType: type,
        query: query ?? null,
      }),
      { scroll: true },
    );
    window.scrollTo(0, 0);
  }

  function handleViewProperty(slug: string) {
    router.push(`/properties/${slug}`, { scroll: true });
    window.scrollTo(0, 0);
  }

  return (
    <div className="font-sans text-black">
      <Nav />
      <Hero
        properties={properties}
        onNavigate={handleNavigateToSearch}
        onViewProperty={handleViewProperty}
      />
      <RecommendedProperties
        properties={properties}
        onViewProperty={handleViewProperty}
      />
      <WhyRise />
      <FullService />
      <AmbitionSection />
      <PopularRealEstate />
      <FinalCTA />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
