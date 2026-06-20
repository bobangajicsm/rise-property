'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Bath, BedDouble, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { formatPrice } from "@/lib/property-formatting";
import {
  hasShortcutIntent,
  matchesShortcutIntent,
  normalizeSearchValue,
  parsePropertySearchIntent,
} from "@/lib/search-intent";
import { cn } from "@/lib/utils";
import { LISTING_TYPES, type Property } from "@/types/property";

interface HeroProps {
  properties: Property[];
  onNavigate: (type: Property["listingType"], query?: string) => void;
  onViewProperty: (slug: string) => void;
}

interface HeroPropertySuggestion {
  id: number;
  slug: string;
  title: string;
  area: string;
  image: string;
  price: number;
  beds: number;
  baths: number;
  period: string;
}

export function Hero({ properties, onNavigate, onViewProperty }: HeroProps) {
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const intent = parsePropertySearchIntent(searchQuery);
    const normalizedQuery = intent.cleanedQuery || intent.normalizedQuery;

    if (!normalizedQuery && !hasShortcutIntent(intent)) {
      return [] as HeroPropertySuggestion[];
    }

    return properties
      .map((property) => {
        if (!matchesShortcutIntent(property, intent)) {
          return null;
        }

        const normalizedArea = normalizeSearchValue(property.area);
        const normalizedLocation = normalizeSearchValue(property.location);
        const normalizedTitle = normalizeSearchValue(property.title);
        const haystack = [normalizedArea, normalizedLocation, normalizedTitle].join(" ");

        if (normalizedQuery && !haystack.includes(normalizedQuery)) {
          return null;
        }

        let score = 40;

        if (intent.bedrooms) {
          score += intent.bedrooms === "4" ? property.beds * 12 : 90;
        }

        if (intent.propertyMatchers.length > 0) {
          score += 70;
        }

        if (normalizedQuery) {
          if (normalizedArea === normalizedQuery) score += 240;
          else if (normalizedArea.startsWith(normalizedQuery)) score += 170;
          else if (normalizedArea.includes(normalizedQuery)) score += 110;

          if (normalizedLocation === normalizedQuery) score += 140;
          else if (normalizedLocation.startsWith(normalizedQuery)) score += 100;
          else if (normalizedLocation.includes(normalizedQuery)) score += 60;

          if (normalizedTitle.startsWith(normalizedQuery)) score += 45;
          else if (normalizedTitle.includes(normalizedQuery)) score += 20;
        } else {
          score += property.price >= 10_000_000 ? 50 : 20;
          if (property.beds >= 4) score += 15;
        }

        return {
          id: property.id,
          slug: property.slug,
          title: property.title,
          area: property.area,
          image: property.images[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=900",
          price: property.price,
          beds: property.beds,
          baths: property.baths,
          period: property.period,
          score,
        };
      })
      .filter((property): property is HeroPropertySuggestion & { score: number } => Boolean(property))
      .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
      .slice(0, 6)
      .map((property) => ({
        id: property.id,
        slug: property.slug,
        title: property.title,
        area: property.area,
        image: property.image,
        price: property.price,
        beds: property.beds,
        baths: property.baths,
        period: property.period,
      }));
  }, [properties, searchQuery]);

  function resetSearch() {
    setIsAutocompleteOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  }

  function handleSearch(query?: string) {
    const value = (query || searchQuery).trim();
    onNavigate(LISTING_TYPES[1], value || undefined);
    resetSearch();
  }

  function handleSelectProperty(slug: string) {
    onViewProperty(slug);
    resetSearch();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      setSelectedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : current,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      setSelectedIndex((current) => (current > -1 ? current - 1 : current));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
      return;
    }

    if (event.key === "Escape") {
      setIsAutocompleteOpen(false);
    }
  }

  useEffect(() => {
    if (!isAutocompleteOpen || !searchQuery.trim()) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAutocompleteOpen, searchQuery]);

  return (
    <>
      <section
        id="home"
        className="relative z-20 flex min-h-[100svh] items-center overflow-visible scroll-mt-28 pt-28 pb-16 md:pt-36 md:pb-20"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2200')",
              backgroundPosition: "center center",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(79,176,161,0.24),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_32%,rgba(0,0,0,0.76)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.34)_36%,rgba(0,0,0,0.2)_62%,rgba(0,0,0,0.52)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-5xl px-1 py-5 md:py-10"
          >
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:gap-10">
              <div className="flex flex-col items-center text-center">
                <span className="mb-4 inline-flex rounded-full border border-white/25 bg-black/18 px-4 py-2 text-[9px] font-bold tracking-[0.32em] text-white/92 uppercase backdrop-blur-md md:mb-5 md:text-xs">
                  Premier Real Estate In Qatar
                </span>
                <h1 className="mb-5 font-serif text-[4rem] leading-[0.92] font-light tracking-[-0.03em] text-white sm:text-6xl md:mb-6 md:text-7xl xl:text-[7.6rem]">
                  Signature Homes,
                  <br />
                  <span className="text-accent italic">Qatar Edition</span>
                </h1>
                <p className="mx-auto max-w-3xl text-[0.95rem] leading-relaxed font-medium tracking-wide text-white/84 md:max-w-2xl md:text-lg">
                  Discover a curated collection of Qatar&apos;s most prestigious
                  addresses, from waterfront penthouses to statement villas and
                  investment-ready residences.
                </p>
              </div>

              <div className="mx-auto flex w-full justify-center">
                <div
                  ref={searchPanelRef}
                  className="relative z-30 w-full max-w-[42rem] text-left"
                >
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-px overflow-hidden rounded-full">
                      <div className="absolute inset-0 rounded-full border border-white/14 bg-white/[0.03]" />
                      <div className="absolute inset-y-1.5 right-5 w-16 rounded-full bg-accent/18 blur-xl md:inset-y-2 md:right-8 md:w-28 md:blur-2xl" />
                    </div>

                    <div className="relative flex min-h-[3.55rem] items-stretch overflow-hidden rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(18,18,18,0.46),rgba(18,18,18,0.66))] shadow-[0_20px_55px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl md:min-h-[4.5rem] md:shadow-[0_26px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="flex w-[3.7rem] shrink-0 items-center justify-center border-r border-white/10 bg-white/[0.05] text-accent md:w-[4.75rem]">
                        <Search className="h-4.5 w-4.5 md:h-5 md:w-5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setIsAutocompleteOpen(true);
                          setSelectedIndex(-1);
                        }}
                        onFocus={() => {
                          if (searchQuery.trim()) {
                            setIsAutocompleteOpen(true);
                          }
                        }}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsAutocompleteOpen(false);
                            setSelectedIndex(-1);
                          }, 120);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="The Pearl, Lusail, 2BHK..."
                        className="min-w-0 flex-1 bg-transparent px-3 text-[0.95rem] leading-tight font-semibold text-white outline-none placeholder:text-white/30 md:px-5 md:text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearch()}
                        className="flex w-[4rem] shrink-0 items-center justify-center bg-accent/95 text-white shadow-[-10px_0_22px_rgba(79,176,161,0.18)] transition-colors hover:bg-accent md:w-[4.9rem] md:shadow-[-12px_0_28px_rgba(79,176,161,0.22)]"
                        aria-label="Search properties"
                      >
                        <ArrowRight className="h-4.5 w-4.5 md:h-5 md:w-5" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isAutocompleteOpen && searchQuery.trim() ? (
                        <motion.div
                          initial={{ opacity: 0, y: 16, scale: 0.985, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 12, scale: 0.99, filter: "blur(6px)" }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="absolute top-[calc(100%+0.75rem)] right-0 left-0 z-40 overflow-hidden rounded-[1.25rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(244,242,237,0.72))] text-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:top-[calc(100%+0.9rem)] md:rounded-[1.45rem] md:shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
                        >
                          <div className="px-4 pt-3 pb-2 md:px-5 md:pt-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[12px] font-medium text-zinc-700 md:text-[13px]">
                                {suggestions.length} listings for `{searchQuery.trim()}`
                              </p>
                              <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setSearchQuery("");
                                  setSelectedIndex(-1);
                                  setIsAutocompleteOpen(false);
                                }}
                                className="text-[11px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                              {suggestions.length > 0 ? (
                                <div className="max-h-[18rem] overflow-y-auto px-2.5 pb-2.5 md:max-h-[22rem] md:px-3 md:pb-3">
                                  {suggestions.map((suggestion, index) => (
                                    <button
                                  key={suggestion.id}
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => handleSelectProperty(suggestion.slug)}
                                  onMouseEnter={() => setSelectedIndex(index)}
                                      className={cn(
                                        "group flex w-full items-center gap-2.5 rounded-[0.95rem] border border-transparent px-2.5 py-2.5 text-left transition-all md:gap-3 md:rounded-[1.05rem] md:px-3 md:py-3",
                                        selectedIndex === index
                                          ? "border-white/40 bg-white/50 text-zinc-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                                          : "text-zinc-900 hover:border-white/30 hover:bg-white/36",
                                      )}
                                    >
                                      <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[0.8rem] bg-zinc-100 shadow-[0_10px_24px_rgba(15,23,42,0.10)] md:h-[70px] md:w-[70px] md:rounded-[0.95rem]">
                                        <Image
                                          src={suggestion.image}
                                          alt={suggestion.title}
                                      fill
                                      sizes="(max-width: 768px) 58px, 72px"
                                      className="object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-[12px] font-semibold tracking-[0.01em] md:text-[13px]">
                                      {suggestion.title}
                                    </p>
                                    <p className="mt-1 text-[12px] font-semibold text-accent md:text-[13px]">
                                      QAR {formatPrice(suggestion.price)}
                                      {suggestion.period ? ` ${suggestion.period}` : ""}
                                    </p>
                                    <div
                                      className={cn(
                                        "mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] font-bold tracking-[0.12em] uppercase md:gap-x-3 md:text-[10px] md:tracking-[0.14em]",
                                        selectedIndex === index ? "text-zinc-700" : "text-zinc-400",
                                      )}
                                    >
                                      <span>{suggestion.area}</span>
                                      <span className="inline-flex items-center gap-1">
                                        <BedDouble className="h-3 w-3" />
                                        {suggestion.beds}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <Bath className="h-3 w-3" />
                                        {suggestion.baths}
                                      </span>
                                    </div>
                                  </div>

                                      <div
                                        className={cn(
                                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all md:h-9 md:w-9",
                                          selectedIndex === index
                                            ? "bg-accent/14 text-accent shadow-[0_8px_20px_rgba(79,176,161,0.14)]"
                                            : "bg-white/70 text-zinc-400 group-hover:text-zinc-700",
                                        )}
                                      >
                                        <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                      </div>
                                    </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-5">
                              <div className="rounded-[1rem] border border-white/20 bg-white/55 px-4 py-4">
                                <p className="text-[12px] font-semibold text-zinc-900">
                                  No listings matched that search.
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                                  Try a location like `The Pearl`, `Lusail`, or `West Bay`.
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-4 md:flex"
        >
          <div className="h-12 w-px bg-gradient-to-b from-accent to-transparent" />
          <span className="text-[8px] font-bold tracking-[0.3em] text-white/68 uppercase">
            Scroll
          </span>
        </motion.div>
      </section>
    </>
  );
}
