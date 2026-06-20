import Link from "next/link";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
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

        <div className="mb-5 flex items-center justify-between md:hidden">
          <span className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
            Swipe Through Picks
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
            {Math.min(properties.length, 4)} Listings
          </span>
        </div>

        <div className="-mx-6 mb-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:hidden no-scrollbar [scrollbar-width:none]">
          {properties.slice(0, 4).map((property) => (
            <div
              key={property.id}
              onClick={() => onViewProperty(property.slug)}
              className="group w-[86vw] max-w-[24rem] shrink-0 snap-start cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
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

        <div className="mb-16 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {properties.slice(0, 4).map((property) => (
            <div
              key={property.id}
              onClick={() => onViewProperty(property.slug)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                <div className="absolute bottom-4 left-4">
                  <div className="text-lg font-bold tracking-wider text-white drop-shadow-lg">
                    QAR {formatPrice(property.price)}{" "}
                    <span className="text-xs font-normal opacity-80">
                      {property.period}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 truncate text-lg font-bold transition-colors group-hover:text-accent">
                  {property.title}
                </h3>
                <div className="mb-6 flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 text-accent" />
                  {property.location}
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
