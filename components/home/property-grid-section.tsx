import { Search, X } from "lucide-react";
import { PropertyCard } from "@/components/home/property-card";
import type { Property } from "@/types/property";

interface PropertyGridSectionProps {
  properties: Property[];
  searchQuery: string;
  onClearSearch: () => void;
  onSelectProperty: (property: Property) => void;
}

export function PropertyGridSection({
  properties,
  searchQuery,
  onClearSearch,
  onSelectProperty,
}: PropertyGridSectionProps) {
  return (
    <section id="properties" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              Curated Selection
            </span>
            <h2 className="font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
              Exceptional Residences
            </h2>
          </div>
          {searchQuery ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-accent uppercase transition-all hover:gap-4"
            >
              Clear Search
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {properties.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => onSelectProperty(property)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-bold">
              No properties found
            </h3>
            <p className="font-light text-gray-400">
              Try adjusting your search criteria or location.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
