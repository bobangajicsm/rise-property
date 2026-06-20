'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  Check,
  ChevronRight,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { saveFeaturedAreasAction } from "@/app/actions";
import { MapLoading } from "@/components/maps/map-loading";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";
import type { FeaturedAreaConfig, FeaturedAreaMutationInput } from "@/types/property";

interface AdminLocationsManagerProps {
  areas: FeaturedAreaConfig[];
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationEditorState {
  mode: "create" | "edit";
  originalName?: string;
  name: string;
  searchQuery: string;
  center: [number, number];
  baseImage: string;
  coverImage: string;
  isPremium: boolean;
  listingCount: number;
  image: string;
  coverSource: FeaturedAreaConfig["coverSource"];
}

interface LocationEditorErrors {
  name?: string;
  searchQuery?: string;
  baseImage?: string;
  coverImage?: string;
  center?: string;
}

const AdminLocationPickerMap = dynamic(
  () =>
    import("@/components/admin/admin-location-picker-map").then(
      (mod) => mod.AdminLocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

function toMutationPayload(areas: FeaturedAreaConfig[]): FeaturedAreaMutationInput[] {
  return [...areas]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map((area) => ({
      name: area.name,
      center: area.center,
      baseImage: area.baseImage?.trim() || area.image,
      isPremium: area.isPremium,
      coverImage: area.coverImage?.trim() || undefined,
    }));
}

function createEditorFromArea(area: FeaturedAreaConfig): LocationEditorState {
  return {
    mode: "edit",
    originalName: area.name,
    name: area.name,
    searchQuery: area.name,
    center: area.center,
    baseImage: area.baseImage?.trim() || area.image,
    coverImage: area.coverImage?.trim() || "",
    isPremium: area.isPremium,
    listingCount: area.listingCount,
    image: area.image,
    coverSource: area.coverSource,
  };
}

function createEmptyEditor(fallbackImage: string): LocationEditorState {
  return {
    mode: "create",
    name: "",
    searchQuery: "",
    center: [25.3694, 51.5511],
    baseImage: fallbackImage,
    coverImage: "",
    isPremium: true,
    listingCount: 0,
    image: fallbackImage,
    coverSource: "default",
  };
}

function isValidUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasChangesBetween(
  currentArea: FeaturedAreaConfig | undefined,
  originalArea: FeaturedAreaConfig | undefined,
) {
  if (!currentArea || !originalArea) {
    return Boolean(currentArea) || Boolean(originalArea);
  }

  return (
    currentArea.name !== originalArea.name ||
    currentArea.center[0] !== originalArea.center[0] ||
    currentArea.center[1] !== originalArea.center[1] ||
    (currentArea.baseImage?.trim() || "") !== (originalArea.baseImage?.trim() || "") ||
    (currentArea.coverImage?.trim() || "") !== (originalArea.coverImage?.trim() || "") ||
    currentArea.isPremium !== originalArea.isPremium
  );
}

function validateEditorState(
  editor: LocationEditorState,
  areas: FeaturedAreaConfig[],
): LocationEditorErrors {
  const errors: LocationEditorErrors = {};
  const nextName = editor.name.trim();

  if (!nextName) {
    errors.name = "Location name is required.";
  }

  if (
    nextName &&
    areas.some(
      (area) =>
        area.name.toLowerCase() === nextName.toLowerCase() &&
        area.name !== editor.originalName,
    )
  ) {
    errors.name = "That location already exists.";
  }

  if (!editor.searchQuery.trim()) {
    errors.searchQuery = "Search for a place or position the pin on the map.";
  }

  if (
    !Number.isFinite(editor.center[0]) ||
    !Number.isFinite(editor.center[1])
  ) {
    errors.center = "Pick a valid location on the map.";
  }

  if (!isValidUrl(editor.baseImage)) {
    errors.baseImage = "Fallback image must be a valid http or https URL.";
  }

  if (!isValidUrl(editor.coverImage)) {
    errors.coverImage = "Custom cover must be a valid http or https URL.";
  }

  return errors;
}

export function AdminLocationsManager({ areas }: AdminLocationsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formState, setFormState] = useState<FeaturedAreaConfig[]>(areas);
  const [editorState, setEditorState] = useState<LocationEditorState | null>(null);
  const [editorErrors, setEditorErrors] = useState<LocationEditorErrors>({});
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  useEffect(() => {
    if (!editorState) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const shouldLockScroll = window.matchMedia("(max-width: 1279px)").matches;

    if (shouldLockScroll) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [editorState]);

  const filteredAreas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...formState]
      .filter((area) =>
        normalizedQuery.length === 0
          ? true
          : area.name.toLowerCase().includes(normalizedQuery),
      )
      .sort((first, second) => {
        if (first.isPremium === second.isPremium) {
          return first.name.localeCompare(second.name);
        }

        return first.isPremium ? -1 : 1;
      });
  }, [formState, query]);

  const premiumCount = formState.filter((area) => area.isPremium).length;
  const hasChanges =
    JSON.stringify(toMutationPayload(formState)) !==
    JSON.stringify(toMutationPayload(areas));
  const changedAreasCount = useMemo(() => {
    const originalMap = new Map(areas.map((area) => [area.name, area]));
    const currentMap = new Map(formState.map((area) => [area.name, area]));
    const names = new Set([...originalMap.keys(), ...currentMap.keys()]);

    return [...names].filter((name) =>
      hasChangesBetween(currentMap.get(name), originalMap.get(name)),
    ).length;
  }, [areas, formState]);

  function resetEditor() {
    setEditorState(null);
    setEditorErrors({});
    setLocationSuggestions([]);
  }

  function openCreateEditor() {
    setEditorErrors({});
    setLocationSuggestions([]);
    setEditorState(createEmptyEditor(formState[0]?.image || ""));
  }

  function openEditEditor(area: FeaturedAreaConfig) {
    setEditorErrors({});
    setLocationSuggestions([]);
    setEditorState(createEditorFromArea(area));
  }

  function applyEditorChanges() {
    if (!editorState) {
      return;
    }

    const validationErrors = validateEditorState(editorState, formState);
    if (Object.keys(validationErrors).length > 0) {
      setEditorErrors(validationErrors);
      setFeedback("Please complete the location details before applying changes.");
      return;
    }

    const nextArea: FeaturedAreaConfig = {
      name: editorState.name.trim(),
      center: editorState.center,
      image:
        editorState.coverImage.trim() ||
        editorState.baseImage.trim() ||
        editorState.image,
      baseImage: editorState.baseImage.trim() || editorState.image,
      isPremium: editorState.isPremium,
      listingCount: editorState.listingCount,
      coverImage: editorState.coverImage.trim() || undefined,
      coverSource: editorState.coverImage.trim() ? "manual" : editorState.coverSource,
    };

    if (editorState.mode === "create") {
      setFormState((current) => [nextArea, ...current]);
      setFeedback("Location added. Save changes to publish it.");
      resetEditor();
      return;
    }

    setFormState((current) =>
      current.map((area) =>
        area.name === editorState.originalName ? nextArea : area,
      ),
    );
    setFeedback("Location updated locally. Save changes to publish it.");
    resetEditor();
  }

  function handleDeleteArea(areaName: string) {
    setFormState((current) => current.filter((area) => area.name !== areaName));
    if (editorState?.originalName === areaName || editorState?.name === areaName) {
      resetEditor();
    }
    setFeedback("Location removed. Save changes to confirm deletion.");
  }

  async function searchLocation(queryValue: string) {
    const normalizedQuery = queryValue.trim();
    if (normalizedQuery.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedQuery)}&limit=6`,
      );
      const payload = (await response.json()) as LocationSuggestion[];
      setLocationSuggestions(payload);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }

  function handleLocationSelect(suggestion: LocationSuggestion) {
    setEditorState((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        searchQuery: suggestion.display_name,
        center: [Number(suggestion.lat), Number(suggestion.lon)],
      };
    });
    setLocationSuggestions([]);
    setEditorErrors((current) => ({
      ...current,
      searchQuery: undefined,
      center: undefined,
    }));
  }

  function handleSave() {
    setFeedback(null);

    startTransition(async () => {
      try {
        const savedAreas = await saveFeaturedAreasAction(toMutationPayload(formState));
        setFormState(savedAreas);
        setFeedback("Prime locations updated.");
      } catch {
        setFeedback("Unable to save location settings right now.");
      }
    });
  }

  return (
    <div className="space-y-6 pb-28 xl:pb-36">
      <section className="border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase">
              Prime Location Control
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-black">
              Manage homepage locations with map-based editing
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Open a location to edit it in the side panel, move the pin on the map,
              and decide whether it should appear inside Prime Locations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-100 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
              {premiumCount} prime areas
            </div>
            {hasChanges ? (
              <div className="bg-accent/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                {changedAreasCount} changed
              </div>
            ) : null}
            <button
              type="button"
              onClick={openCreateEditor}
              className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-[0.22em] uppercase transition-all xl:hidden",
                isPending || !hasChanges
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-accent text-white hover:bg-black",
              )}
            >
              {isPending ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isPending ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search locations"
              className="w-full border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {feedback ? (
            <div className="bg-accent/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
              {feedback}
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredAreas.map((area) => (
          <button
            key={area.name}
            type="button"
            onClick={() => openEditEditor(area)}
            className="group overflow-hidden border border-black/5 bg-white text-left shadow-sm transition-all hover:border-accent/30 hover:shadow-lg"
          >
            <div className="relative aspect-[16/9] bg-gray-100">
              <img
                src={area.coverImage?.trim() ? area.coverImage : area.image}
                alt={area.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-white/85 px-2.5 py-1 text-[9px] font-bold tracking-[0.18em] text-black uppercase backdrop-blur-sm">
                  {area.listingCount} listings
                </span>
                {area.isPremium ? (
                  <span className="bg-accent px-2.5 py-1 text-[9px] font-bold tracking-[0.18em] text-white uppercase">
                    Prime
                  </span>
                ) : null}
              </div>
              <div className="absolute right-4 bottom-4 left-4">
                <p className="text-xl font-semibold text-white">{area.name}</p>
                <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-white/75 uppercase">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {area.center[0].toFixed(3)}, {area.center[1].toFixed(3)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Cover Source
                </p>
                <p className="mt-1 text-sm text-black capitalize">{area.coverSource}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase transition-colors group-hover:text-accent">
                Edit Location
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[120] transition-opacity duration-300",
          editorState ? "pointer-events-auto bg-black/30 opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={resetEditor}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 z-[130] flex h-dvh w-full max-w-[680px] flex-col border-l border-black/10 bg-white shadow-2xl transition-transform duration-300",
          editorState ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!editorState}
      >
        {editorState ? (
          <>
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 md:px-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
                  {editorState.mode === "create" ? "New Location" : "Edit Location"}
                </p>
                <h4 className="mt-1 text-lg font-semibold text-black">
                  {editorState.mode === "create"
                    ? "Create a location with map pin"
                    : editorState.name || "Update location details"}
                </h4>
              </div>
              <button
                type="button"
                onClick={resetEditor}
                className="flex h-10 w-10 items-center justify-center border border-black/10 bg-white text-gray-500 transition-colors hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="space-y-6">
                <section className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                      Location Name
                    </label>
                    <input
                      type="text"
                      value={editorState.name}
                      onChange={(event) => {
                        const nextName = event.target.value;
                        setEditorState((current) =>
                          current ? { ...current, name: nextName } : current,
                        );
                        setEditorErrors((current) => ({ ...current, name: undefined }));
                      }}
                      placeholder="The Pearl, West Bay, Lusail..."
                      className={cn(
                        "w-full border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                        editorErrors.name ? "border-red-300" : "border-gray-200",
                      )}
                    />
                    {editorErrors.name ? (
                      <p className="mt-2 text-xs text-red-600">{editorErrors.name}</p>
                    ) : null}
                  </div>

                  <div className="relative">
                    <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                      Search With Map
                    </label>
                    <input
                      type="text"
                      value={editorState.searchQuery}
                      onChange={(event) => {
                        const nextQuery = event.target.value;
                        setEditorState((current) =>
                          current ? { ...current, searchQuery: nextQuery } : current,
                        );
                        setEditorErrors((current) => ({
                          ...current,
                          searchQuery: undefined,
                          center: undefined,
                        }));
                        void searchLocation(nextQuery);
                      }}
                      placeholder="Search area or address, then refine on the map"
                      className={cn(
                        "w-full border bg-gray-50 px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-accent",
                        editorErrors.searchQuery || editorErrors.center
                          ? "border-red-300"
                          : "border-gray-200",
                      )}
                    />
                    {isSearchingLocation ? (
                      <LoaderCircle className="absolute top-[calc(50%+12px)] right-4 h-4 w-4 -translate-y-1/2 animate-spin text-accent" />
                    ) : null}
                    {locationSuggestions.length > 0 ? (
                      <div className="absolute top-full right-0 left-0 z-20 mt-2 border border-gray-100 bg-white shadow-2xl">
                        {locationSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.lat}-${suggestion.lon}`}
                            type="button"
                            onClick={() => handleLocationSelect(suggestion)}
                            className="w-full border-b border-gray-50 px-4 py-3 text-left text-xs transition-colors last:border-b-0 hover:bg-gray-50"
                          >
                            {suggestion.display_name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {editorErrors.searchQuery ? (
                      <p className="mt-2 text-xs text-red-600">
                        {editorErrors.searchQuery}
                      </p>
                    ) : null}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                        Location Pin
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Click the map to refine the center point used on the site.
                      </p>
                    </div>
                    <div className="bg-gray-100 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                      {editorState.center[0].toFixed(4)}, {editorState.center[1].toFixed(4)}
                    </div>
                  </div>
                  <AdminLocationPickerMap
                    lat={editorState.center[0]}
                    lng={editorState.center[1]}
                    onChange={(next) => {
                      setEditorState((current) =>
                        current
                          ? {
                              ...current,
                              center: [next.lat, next.lng],
                              searchQuery: next.location ?? current.searchQuery,
                            }
                          : current,
                      );
                      setEditorErrors((current) => ({
                        ...current,
                        center: undefined,
                        searchQuery: undefined,
                      }));
                    }}
                  />
                  {editorErrors.center ? (
                    <p className="mt-2 text-xs text-red-600">{editorErrors.center}</p>
                  ) : null}
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                      Fallback Image URL
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={editorState.baseImage}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  baseImage: nextValue,
                                  image: current.coverImage.trim()
                                    ? current.image
                                    : (nextValue.trim() || current.image),
                                }
                              : current,
                          );
                          setEditorErrors((current) => ({
                            ...current,
                            baseImage: undefined,
                          }));
                        }}
                        placeholder="https://..."
                        className={cn(
                          "w-full border bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent",
                          editorErrors.baseImage ? "border-red-300" : "border-gray-200",
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Used when there is no better inventory image available.
                    </p>
                    {editorErrors.baseImage ? (
                      <p className="mt-2 text-xs text-red-600">{editorErrors.baseImage}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                        Custom Cover URL
                      </label>
                      {editorState.coverImage ? (
                        <button
                          type="button"
                          onClick={() =>
                            setEditorState((current) =>
                              current
                                ? {
                                    ...current,
                                    coverImage: "",
                                  }
                                : current,
                            )
                          }
                          className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase transition-colors hover:text-black"
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={editorState.coverImage}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setEditorState((current) =>
                            current
                              ? {
                                  ...current,
                                  coverImage: nextValue,
                                }
                              : current,
                          );
                          setEditorErrors((current) => ({
                            ...current,
                            coverImage: undefined,
                          }));
                        }}
                        placeholder="https://..."
                        className={cn(
                          "w-full border bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent",
                          editorErrors.coverImage ? "border-red-300" : "border-gray-200",
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Leave empty to let the site use inventory imagery automatically.
                    </p>
                    {editorErrors.coverImage ? (
                      <p className="mt-2 text-xs text-red-600">{editorErrors.coverImage}</p>
                    ) : null}
                  </div>
                </section>

                <section className="border border-black/5 bg-gray-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                        Homepage Visibility
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Mark this location as premium to show it inside Prime Locations.
                      </p>
                    </div>

                    <ToggleSwitch
                      label="Show in Prime Locations"
                      checked={editorState.isPremium}
                      onCheckedChange={(checked) =>
                        setEditorState((current) =>
                          current ? { ...current, isPremium: checked } : current,
                        )
                      }
                      onLabel="Premium"
                      offLabel="Hidden"
                    />
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-black/5 px-5 py-4 md:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {editorState.mode === "edit" ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteArea(editorState.originalName ?? editorState.name)}
                    className="inline-flex items-center justify-center gap-2 border border-red-200 px-4 py-3 text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase transition-all hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Location
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="px-5 py-3 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase transition-colors hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyEditorChanges}
                    className="inline-flex items-center gap-2 bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
                  >
                    <Check className="h-4 w-4" />
                    {editorState.mode === "create" ? "Add Location" : "Apply Changes"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </aside>

      <div className="pointer-events-none fixed right-4 bottom-4 z-[90] hidden xl:flex xl:justify-end">
        <div className="pointer-events-auto flex w-auto max-w-[920px] items-center gap-4 border border-black/8 bg-white/96 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="min-w-0 pr-1">
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Prime Locations
            </p>
            <p className="mt-1 whitespace-nowrap text-sm text-gray-600">
              {hasChanges
                ? `${changedAreasCount} location${changedAreasCount === 1 ? "" : "s"} ready to save.`
                : "All changes are already saved."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {feedback ? (
              <div className="inline-flex h-10 items-center bg-accent/10 px-4 text-[10px] font-bold tracking-[0.18em] text-accent uppercase whitespace-nowrap">
                {feedback}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className={cn(
                "inline-flex h-10 items-center gap-2 px-5 text-[10px] font-bold tracking-[0.22em] uppercase transition-all whitespace-nowrap",
                isPending || !hasChanges
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-black text-white hover:bg-accent",
              )}
            >
              {isPending ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isPending ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
