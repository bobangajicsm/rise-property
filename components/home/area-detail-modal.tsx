'use client';

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Home, Key, List, Map as MapIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MapLoading } from "@/components/maps/map-loading";
import { applyDrawnMapFilters, DrawnMapItem } from "@/lib/map-filters";
import { formatPrice } from "@/lib/property-formatting";
import { cn } from "@/lib/utils";
import { LISTING_TYPE_META, LISTING_TYPES, type Property } from "@/types/property";

const AreaPropertiesMap = dynamic(
  () =>
    import("@/components/maps/area-properties-map").then(
      (mod) => mod.AreaPropertiesMap,
    ),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

interface AreaDetailModalProps {
  areaName: string;
  areaCenter?: [number, number];
  properties: Property[];
  initialFilters?: {
    listingType: Property["listingType"];
    priceRange: string;
    bedrooms: string;
    type: string;
  };
  onClose: () => void;
  onViewProperty: (slug: string) => void;
}

export function AreaDetailModal({
  areaName,
  areaCenter,
  properties,
  initialFilters,
  onClose,
  onViewProperty,
}: AreaDetailModalProps) {
  const [drawnItems, setDrawnItems] = useState<DrawnMapItem[]>([]);
  const [modalFilters, setModalFilters] = useState({
    listingType: initialFilters?.listingType ?? LISTING_TYPES[0],
    priceRange: initialFilters?.priceRange ?? "all",
    bedrooms: initialFilters?.bedrooms ?? "all",
    type: initialFilters?.type ?? "all",
    sortBy: "price-desc",
  });
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const center = areaCenter ?? [25.2854, 51.531];

  const baseFilteredProperties = useMemo(() => {
    return properties
      .filter((property) => property.area === areaName)
      .filter((property) => {
        const matchesListingType =
          property.listingType === modalFilters.listingType;
        const matchesType =
          modalFilters.type === "all" || property.type === modalFilters.type;
        const matchesBedrooms =
          modalFilters.bedrooms === "all" ||
          property.beds === Number.parseInt(modalFilters.bedrooms, 10);

        let matchesPrice = true;
        if (modalFilters.listingType === LISTING_TYPES[0]) {
          if (modalFilters.priceRange === "low") {
            matchesPrice = property.price < 2_000_000;
          }
          if (modalFilters.priceRange === "mid") {
            matchesPrice =
              property.price >= 2_000_000 && property.price < 10_000_000;
          }
          if (modalFilters.priceRange === "high") {
            matchesPrice = property.price >= 10_000_000;
          }
        } else {
          if (modalFilters.priceRange === "low") {
            matchesPrice = property.price < 10_000;
          }
          if (modalFilters.priceRange === "mid") {
            matchesPrice = property.price >= 10_000 && property.price < 25_000;
          }
          if (modalFilters.priceRange === "high") {
            matchesPrice = property.price >= 25_000;
          }
        }

        return matchesListingType && matchesType && matchesBedrooms && matchesPrice;
      })
      .sort((first, second) => {
        if (modalFilters.sortBy === "price-asc") {
          return first.price - second.price;
        }
        if (modalFilters.sortBy === "beds-desc") {
          return second.beds - first.beds;
        }
        return second.price - first.price;
      });
  }, [areaName, modalFilters, properties]);

  const filteredProperties = useMemo(
    () => applyDrawnMapFilters(baseFilteredProperties, drawnItems),
    [baseFilteredProperties, drawnItems],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-wider text-black uppercase">
              {areaName}
            </h2>
            <div className="mt-1 flex items-center gap-4">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {filteredProperties.length} Properties Available
              </p>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all",
                    viewMode === "list"
                      ? "bg-white text-accent shadow-sm"
                      : "text-gray-400 hover:text-gray-600",
                  )}
                >
                  <List className="h-3 w-3" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all",
                    viewMode === "map"
                      ? "bg-white text-accent shadow-sm"
                      : "text-gray-400 hover:text-gray-600",
                  )}
                >
                  <MapIcon className="h-3 w-3" />
                  Map
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-black" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 bg-gray-50/50 p-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-4">
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setModalFilters((current) => ({
                    ...current,
                    listingType: LISTING_TYPES[0],
                  }))
                }
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                  modalFilters.listingType === LISTING_TYPES[0]
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                <Home className="h-3.5 w-3.5" />
                {LISTING_TYPE_META.buy.label}
              </button>
              <button
                type="button"
                onClick={() =>
                  setModalFilters((current) => ({
                    ...current,
                    listingType: LISTING_TYPES[1],
                  }))
                }
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                  modalFilters.listingType === LISTING_TYPES[1]
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                <Key className="h-3.5 w-3.5" />
                {LISTING_TYPE_META.rent.label}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Price Range
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={modalFilters.priceRange}
              onChange={(event) =>
                setModalFilters((current) => ({
                  ...current,
                  priceRange: event.target.value,
                }))
              }
            >
              <option value="all">All Prices</option>
              <option value="low">
                {modalFilters.listingType === LISTING_TYPES[0]
                  ? "Under 2M QAR"
                  : "Under 10K QAR"}
              </option>
              <option value="mid">
                {modalFilters.listingType === LISTING_TYPES[0]
                  ? "2M - 10M QAR"
                  : "10K - 25K QAR"}
              </option>
              <option value="high">
                {modalFilters.listingType === LISTING_TYPES[0] ? "10M+ QAR" : "25K+ QAR"}
              </option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Bedrooms
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={modalFilters.bedrooms}
              onChange={(event) =>
                setModalFilters((current) => ({
                  ...current,
                  bedrooms: event.target.value,
                }))
              }
            >
              <option value="all">Any Beds</option>
              <option value="1">1 Bed</option>
              <option value="2">2 Beds</option>
              <option value="3">3 Beds</option>
              <option value="4">4+ Beds</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Type
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={modalFilters.type}
              onChange={(event) =>
                setModalFilters((current) => ({
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
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              Sort By
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-accent/20"
              value={modalFilters.sortBy}
              onChange={(event) =>
                setModalFilters((current) => ({
                  ...current,
                  sortBy: event.target.value,
                }))
              }
            >
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="beds-desc">Most Bedrooms</option>
            </select>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 p-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProperties.map((property) => (
                  <motion.div
                    key={property.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 rounded-sm bg-white/90 px-3 py-1 text-[9px] font-bold tracking-widest uppercase backdrop-blur-sm">
                        {property.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-black">
                          QAR {formatPrice(property.price)}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          {property.beds} Beds
                        </span>
                      </div>
                      <p className="mb-4 text-xs font-light text-gray-500">
                        Premium {property.type} located in the heart of {areaName}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewProperty(property.slug);
                        }}
                        className="w-full rounded-lg bg-gray-50 py-3 text-[10px] font-bold tracking-widest text-black uppercase transition-all hover:bg-black hover:text-white"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filteredProperties.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-sm font-light text-gray-400">
                      No properties match your current filters.
                    </p>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <AreaPropertiesMap
                  center={center}
                  properties={filteredProperties}
                  drawnItems={drawnItems}
                  onDrawnItemsChange={setDrawnItems}
                  onViewProperty={(id) => {
                    onClose();
                    const property = filteredProperties.find((entry) => entry.id === id);
                    if (property) {
                      onViewProperty(property.slug);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
