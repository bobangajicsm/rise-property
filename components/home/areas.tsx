'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, Key, RotateCcw } from "lucide-react";
import { AreaDetailModal } from "@/components/home/area-detail-modal";
import { buildListingPath } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  LISTING_TYPE_META,
  LISTING_TYPES,
  type FeaturedAreaConfig,
  type Property,
} from "@/types/property";

interface AreasProps {
  properties: Property[];
  featuredAreas: FeaturedAreaConfig[];
  onViewProperty: (slug: string) => void;
}

export function Areas({ properties, featuredAreas, onViewProperty }: AreasProps) {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<FeaturedAreaConfig | null>(null);
  const [filters, setFilters] = useState({
    listingType: LISTING_TYPES[0] as Property["listingType"],
    priceRange: "all",
    bedrooms: "all",
    type: "all",
  });

  useEffect(() => {
    document.body.style.overflow = selectedArea ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedArea]);

  function matchesPriceFilter(property: Property) {
    if (filters.priceRange === "all") {
      return true;
    }

    if (filters.listingType === LISTING_TYPES[0]) {
      if (filters.priceRange === "low") {
        return property.price < 2_000_000;
      }

      if (filters.priceRange === "mid") {
        return property.price >= 2_000_000 && property.price < 10_000_000;
      }

      return property.price >= 10_000_000;
    }

    if (filters.priceRange === "low") {
      return property.price < 10_000;
    }

    if (filters.priceRange === "mid") {
      return property.price >= 10_000 && property.price < 25_000;
    }

    return property.price >= 25_000;
  }

  function getFilteredCount(areaName: string) {
    return properties.filter((property) => {
      const matchesListingType = property.listingType === filters.listingType;
      const matchesArea = property.area === areaName;
      const matchesType =
        filters.type === "all" || property.type === filters.type;
      const matchesBedrooms =
        filters.bedrooms === "all" ||
        property.beds === Number.parseInt(filters.bedrooms, 10);
      const matchesPrice = matchesPriceFilter(property);

      return (
        matchesListingType &&
        matchesArea &&
        matchesType &&
        matchesBedrooms &&
        matchesPrice
      );
    }).length;
  }

  const matchingInventory = properties.filter((property) => {
    const matchesListingType = property.listingType === filters.listingType;
    const matchesType = filters.type === "all" || property.type === filters.type;
    const matchesBedrooms =
      filters.bedrooms === "all" ||
      property.beds === Number.parseInt(filters.bedrooms, 10);

    return (
      matchesListingType &&
      matchesType &&
      matchesBedrooms &&
      matchesPriceFilter(property)
    );
  }).length;

  const matchingAreas = featuredAreas.filter(
    (area) => getFilteredCount(area.name) > 0,
  ).length;
  const sortedAreas = [...featuredAreas]
    .map((area) => ({
      area,
      count: getFilteredCount(area.name),
    }))
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      if (second.area.listingCount !== first.area.listingCount) {
        return second.area.listingCount - first.area.listingCount;
      }

      return first.area.name.localeCompare(second.area.name);
    });
  const topMatchingArea = sortedAreas.find((item) => item.count > 0);

  function resetFilters() {
    setFilters({
      listingType: LISTING_TYPES[0],
      priceRange: "all",
      bedrooms: "all",
      type: "all",
    });
  }

  return (
    <section id="areas" className="bg-gray-50 py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
              Prime Locations
            </span>
            <h2 className="font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
              Explore Qatar&apos;s Finest
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
              {topMatchingArea
                ? `${topMatchingArea.area.name} is the strongest match right now with ${topMatchingArea.count} ${topMatchingArea.count === 1 ? "property" : "properties"} available.`
                : "No prime locations match the current filters yet. Reset the filters to bring inventory back."}
            </p>
          </div>
          <button
            type="button"
            disabled={matchingInventory === 0}
            onClick={() =>
              router.push(
                buildListingPath(filters.listingType, {
                  priceRange: filters.priceRange,
                  bedrooms: filters.bedrooms,
                }),
                { scroll: true },
              )
            }
            className={cn(
              "group flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-all",
              matchingInventory === 0
                ? "cursor-not-allowed text-gray-300"
                : "hover:gap-5",
            )}
          >
            View Matching Listings
            <ArrowRight
              className={cn(
                "h-5 w-5 transition-transform",
                matchingInventory === 0
                  ? "text-gray-300"
                  : "text-accent group-hover:translate-x-1",
              )}
            />
          </button>
        </div>

        <div className="mb-12 rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-600 uppercase">
                Filter Inventory
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {matchingInventory} properties across {matchingAreas} prime areas
                match the current filters.
              </p>
              {matchingInventory === 0 ? (
                <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
                  No matches right now. Try resetting filters or switching listing type.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      listingType: LISTING_TYPES[0],
                    }))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                    filters.listingType === LISTING_TYPES[0]
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black",
                  )}
                >
                  <Home className="h-3.5 w-3.5" />
                  {LISTING_TYPE_META.buy.label}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFilters((current) => ({ ...current, listingType: LISTING_TYPES[1] }))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                    filters.listingType === LISTING_TYPES[1]
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black",
                  )}
                >
                  <Key className="h-3.5 w-3.5" />
                  {LISTING_TYPE_META.rent.label}
                </button>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-700 uppercase transition-colors hover:border-black hover:text-black"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
              Price Range (QAR)
            </label>
            <select
              className="w-full cursor-pointer rounded-lg border-none bg-gray-50 px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={filters.priceRange}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  priceRange: event.target.value,
                }))
              }
            >
              <option value="all">All Prices</option>
              <option value="low">
                {filters.listingType === LISTING_TYPES[0] ? "Under 2M QAR" : "Under 10K QAR"}
              </option>
              <option value="mid">
                {filters.listingType === LISTING_TYPES[0] ? "2M - 10M QAR" : "10K - 25K QAR"}
              </option>
              <option value="high">
                {filters.listingType === LISTING_TYPES[0] ? "10M+ QAR" : "25K+ QAR"}
              </option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
              Bedrooms
            </label>
            <select
              className="w-full cursor-pointer rounded-lg border-none bg-gray-50 px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={filters.bedrooms}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  bedrooms: event.target.value,
                }))
              }
            >
              <option value="all">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
              Property Type
            </label>
            <select
              className="w-full cursor-pointer rounded-lg border-none bg-gray-50 px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={filters.type}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              <option value="all">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Office">Office</option>
              <option value="Shop">Shop</option>
            </select>
          </div>
        </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sortedAreas.map(({ area, count }, index) => {
            const hasMatches = count > 0;

            return (
              <div
                key={area.name}
                onClick={() => {
                  if (!hasMatches) {
                    return;
                  }

                  setSelectedArea(area);
                }}
                className={cn(
                  "group relative aspect-[4/5] overflow-hidden rounded-xl shadow-sm transition-all duration-500",
                  hasMatches
                    ? "cursor-pointer hover:shadow-xl"
                    : "cursor-not-allowed opacity-75",
                )}
              >
                <img
                  src={area.image}
                  alt={area.name}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-1000",
                    hasMatches ? "group-hover:scale-110" : "grayscale-[0.15]",
                  )}
                  referrerPolicy="no-referrer"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-500",
                    hasMatches ? "group-hover:opacity-90" : "opacity-90",
                  )}
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {index === 0 && hasMatches ? (
                    <span className="rounded-full bg-accent px-3 py-1 text-[8px] font-bold tracking-[0.24em] text-white uppercase shadow-sm">
                      Best Match
                    </span>
                  ) : null}
                  {!hasMatches ? (
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-[8px] font-bold tracking-[0.24em] text-black uppercase shadow-sm">
                      No Match
                    </span>
                  ) : null}
                </div>
                <div className="absolute right-0 bottom-0 left-0 w-full p-8 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="mb-2 font-display text-2xl font-bold tracking-wider text-white uppercase">
                    {area.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-xs font-bold tracking-widest uppercase",
                        hasMatches ? "text-accent" : "text-white/85",
                      )}
                    >
                      {hasMatches
                        ? `${count} ${count === 1 ? "Property" : "Properties"}`
                        : "0 Properties Available"}
                    </p>
                    {hasMatches ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100">
                        <ArrowRight className="h-4 w-4 text-white" />
                      </div>
                    ) : null}
                  </div>
                  {!hasMatches ? (
                    <p className="mt-3 text-[11px] leading-relaxed text-white/80">
                      This area has no properties for the current filters.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedArea ? (
        <AreaDetailModal
          areaName={selectedArea.name}
          areaCenter={selectedArea.center}
          properties={properties}
          initialFilters={filters}
          onClose={() => setSelectedArea(null)}
          onViewProperty={onViewProperty}
        />
      ) : null}
    </section>
  );
}
