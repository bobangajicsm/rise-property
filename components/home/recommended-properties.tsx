'use client';

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bath,
  Bed,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/property-formatting";
import type { Property } from "@/types/property";

interface RecommendedPropertiesProps {
  properties: Property[];
  onViewProperty: (slug: string) => void;
}

export function RecommendedProperties({
  properties,
  onViewProperty,
}: RecommendedPropertiesProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const visibleProperties = properties.slice(0, 8);

  function scrollProperties(direction: "previous" | "next") {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const distance = Math.min(scroller.clientWidth * 0.85, 920);
    scroller.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  }

  return (
    <section id="properties" className="bg-white py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
            Handpicked
          </span>
          <h2 className="mb-6 font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
            Recommended Properties
          </h2>
          <p className="max-w-2xl leading-relaxed font-light text-gray-700">
            Search Apartments, Villas and Offices in Doha, Lusail, The Pearl,
            and West Bay that have the most exclusive and verified properties
            along Qatar.
          </p>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Swipe Through Picks
            </span>
            <span className="ml-3 text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              {visibleProperties.length} Listings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollProperties("previous")}
              aria-label="Previous listings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition-all hover:border-accent hover:bg-accent hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollProperties("next")}
              aria-label="Next listings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-black transition-all hover:border-accent hover:bg-accent hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-6 mb-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 no-scrollbar [scrollbar-width:none] md:gap-5"
        >
          {visibleProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => onViewProperty(property.slug)}
              className="group w-[86vw] max-w-[24rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:w-[20rem] lg:w-[21rem]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.badges.map((badge) => (
                    <span
                      key={badge}
                      className={cn(
                        "rounded-sm px-3 py-1 text-[9px] font-bold tracking-widest",
                        badge === "FEATURED"
                          ? "bg-accent text-white"
                          : "bg-white/90 text-black",
                      )}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewProperty(property.slug);
                  }}
                  className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[8px] font-bold tracking-widest text-black uppercase shadow-sm backdrop-blur-md transition-colors hover:bg-black hover:text-white"
                >
                  View
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <div className="text-lg font-bold tracking-wider text-white drop-shadow-lg">
                    QAR {formatPrice(property.price)}{" "}
                    <span className="text-xs font-normal opacity-80">
                      {property.period}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-2 line-clamp-1 text-lg font-bold text-black">
                  {property.title}
                </h3>
                <div className="mb-5 flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] font-bold tracking-widest text-gray-700 uppercase">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-accent" />
                    {property.beds}
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-accent" />
                    {property.baths}
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-accent" />
                    {property.sqft}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/rent"
            className="border border-gray-200 bg-white px-8 py-3 text-[10px] font-bold tracking-[0.2em] text-accent uppercase transition-all hover:bg-accent hover:text-white"
          >
            Browse All Properties For Rent
          </Link>
          <Link
            href="/buy"
            className="border border-gray-200 bg-white px-8 py-3 text-[10px] font-bold tracking-[0.2em] text-accent uppercase transition-all hover:bg-accent hover:text-white"
          >
            Browse All Properties For Sale
          </Link>
        </div>
      </div>
    </section>
  );
}
