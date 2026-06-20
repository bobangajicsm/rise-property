import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import { BrandMark } from "@/components/home/brand-mark";
import { SEARCH_LOCATIONS } from "@/data/properties";
import { DEFAULT_PROPERTY_TYPE_MUTATIONS } from "@/lib/property-types";

interface SearchOverlayProps {
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function SearchOverlay({
  searchQuery,
  onChangeSearch,
  onClose,
  onSubmit,
}: SearchOverlayProps) {
  const popularAreas = SEARCH_LOCATIONS.slice(0, 6);
  const propertyTypes = DEFAULT_PROPERTY_TYPE_MUTATIONS.map((entry) => entry.label);

  function selectValue(value: string) {
    onSubmit(value);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-white p-6 md:p-12"
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
        <div className="mb-12 flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close search"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="relative mx-auto w-full max-w-4xl">
            <Search className="absolute top-1/2 left-0 h-12 w-12 -translate-y-1/2 text-accent" />
            <input
              autoFocus
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(event) => onChangeSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSubmit(searchQuery);
                }
              }}
              className="w-full border-b-4 border-gray-100 bg-transparent py-12 pr-4 pl-20 font-display text-5xl font-bold transition-all placeholder:text-gray-100 focus:border-accent focus:outline-none md:text-7xl"
            />
          </div>

          <div className="mx-auto mt-12 grid w-full max-w-4xl gap-12 md:grid-cols-3">
            <div>
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                Popular Areas
              </h4>
              <div className="flex flex-col gap-4">
                {popularAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => selectValue(area)}
                    className="text-left font-display text-xl font-medium transition-colors hover:text-accent"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-6 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                Property Types
              </h4>
              <div className="flex flex-col gap-4">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectValue(type)}
                    className="text-left font-display text-xl font-medium transition-colors hover:text-accent"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
