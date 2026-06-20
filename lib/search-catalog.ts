import { POPULAR_LINKS } from "@/data/properties";
import {
  SEO_SEARCH_PAGES,
  filterPropertiesForSeoPageWithFallback,
  getSeoSearchPageByLabel,
} from "@/data/seo-search-pages";
import { buildSearchPath } from "@/lib/site";
import type { Property } from "@/types/property";

export interface MegaSearchLink {
  label: string;
  href: string;
  count?: number;
}

export interface MegaSearchGroup {
  title: string;
  links: MegaSearchLink[];
}

export function buildMegaSearchGroups(properties: Property[]): MegaSearchGroup[] {
  return POPULAR_LINKS.map((group) => ({
    title: group.title,
    links: group.links.map((link) => {
      const page = getSeoSearchPageByLabel(link.label);

      return {
        label: link.label,
        href: link.href,
        count: page
          ? filterPropertiesForSeoPageWithFallback(properties, page).length
          : undefined,
      };
    }),
  }));
}

export function buildMegaSearchHighlights(properties: Property[]) {
  const areaCounts = properties.reduce<Map<string, number>>((counts, property) => {
    counts.set(property.area, (counts.get(property.area) ?? 0) + 1);
    return counts;
  }, new Map());

  const topAreas = [...areaCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([area, count]) => ({
      label: area,
      count,
      href: buildSearchPath({
        listingType: "buy",
        query: area,
      }),
    }));

  const featuredCollections = SEO_SEARCH_PAGES.slice(0, 4).map((page) => ({
    label: page.title,
    count: filterPropertiesForSeoPageWithFallback(properties, page).length,
    href: `/search/${page.slug}`,
  }));

  return {
    topAreas,
    featuredCollections,
  };
}
