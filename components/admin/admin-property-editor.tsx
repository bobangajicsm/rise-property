'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";
import { savePropertyAction } from "@/app/actions";
import { MapLoading } from "@/components/maps/map-loading";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  defaultPropertyAgent,
  getPropertyAgentById,
  PROPERTY_AGENTS,
  resolvePropertyAgent,
} from "@/data/agents";
import { AREAS } from "@/data/properties";
import { getPropertyUsage } from "@/lib/property-formatting";
import { buildPropertySlug } from "@/lib/property-slug";
import { buildPropertyTypeOptions } from "@/lib/property-types";
import { cn } from "@/lib/utils";
import {
  LISTING_TYPE_META,
  LISTING_TYPES,
  PROPERTY_USAGE_COMMERCIAL,
  PROPERTY_USAGE_META,
  PROPERTY_USAGE_RESIDENTIAL,
  PROPERTY_USAGES,
  PROPERTY_VISIBILITY_DRAFT,
  PROPERTY_VISIBILITY_META,
  PROPERTY_VISIBILITY_PUBLISHED,
  PROPERTY_VISIBILITY_STATUSES,
  type Property,
  type PropertyMutationInput,
  type PropertyTypeConfig,
} from "@/types/property";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface PropertyFormState {
  id?: number;
  title: string;
  location: string;
  price: string;
  badges: string[];
  listingType: Property["listingType"];
  visibilityStatus: Property["visibilityStatus"];
  usage: Property["usage"];
  type: string;
  area: string;
  beds: string;
  baths: string;
  sqftValue: string;
  lat: string;
  lng: string;
  description: string;
  featuresText: string;
  imagesText: string;
  yearBuilt: string;
  parking: string;
  furnished: boolean;
  videoUrl: string;
  videoThumbnail: string;
  agentId: string;
}

interface AdminPropertyEditorProps {
  property?: Property;
  propertyTypes: PropertyTypeConfig[];
}

type FieldErrorMap = Partial<Record<
  | "title"
  | "location"
  | "price"
  | "beds"
  | "baths"
  | "sqftValue"
  | "description"
  | "images"
  | "mapPin"
  | "videoUrl"
  | "videoThumbnail",
  string
>>;

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

const LISTING_BADGE_OPTIONS = [
  {
    value: "NEW",
    label: "New",
    description: "Use for fresh listings that just went live.",
  },
  {
    value: "FEATURED",
    label: "Featured",
    description: "Highlight this listing across the public experience.",
  },
  {
    value: "PREMIUM",
    label: "Premium",
    description: "Mark stronger quality or positioning in the catalog.",
  },
  {
    value: "LUXURY",
    label: "Luxury",
    description: "Use for top-tier inventory and high-end residences.",
  },
  {
    value: "EXCLUSIVE",
    label: "Exclusive",
    description: "Use when the listing is exclusive to your agency.",
  },
] as const;

function normalizeBadges(input: string[]) {
  const uniqueBadges = [...new Set(input.map((badge) => badge.trim()).filter(Boolean))];
  return uniqueBadges.length > 0 ? uniqueBadges : ["NEW"];
}

function getDefaultPropertyTypeForUsage(
  propertyTypes: PropertyTypeConfig[],
  usage: Property["usage"],
  fallbackLabel?: string,
) {
  const options = buildPropertyTypeOptions({
    propertyTypes,
    usage,
    fallbackLabels: fallbackLabel ? [fallbackLabel] : [],
  });

  return options[0] ?? (usage === PROPERTY_USAGE_COMMERCIAL ? "Office" : "Apartment");
}

function createEmptyFormState(propertyTypes: PropertyTypeConfig[]): PropertyFormState {
  const usage: Property["usage"] = PROPERTY_USAGE_RESIDENTIAL;

  return {
    title: "",
    location: "",
    price: "",
    badges: ["NEW"],
    listingType: LISTING_TYPES[0],
    visibilityStatus: PROPERTY_VISIBILITY_DRAFT,
    usage,
    type: getDefaultPropertyTypeForUsage(propertyTypes, usage),
    area: AREAS[0]?.name ?? "The Pearl",
    beds: "2",
    baths: "2",
    sqftValue: "1200",
    lat: String(AREAS[0]?.center[0] ?? 25.3694),
    lng: String(AREAS[0]?.center[1] ?? 51.5511),
    description: "",
    featuresText: "Smart Home System\nInfinity Pool\nPrivate Balcony",
    imagesText: "",
    yearBuilt: "",
    parking: "",
    furnished: false,
    videoUrl: "",
    videoThumbnail: "",
    agentId: defaultPropertyAgent.id,
  };
}

function propertyToFormState(
  property: Property,
  propertyTypes: PropertyTypeConfig[],
): PropertyFormState {
  const usage = property.usage ?? getPropertyUsage(property);
  const propertyAgent = resolvePropertyAgent(property.agent);

  return {
    id: property.id,
    title: property.title,
    location: property.location,
    price: String(property.price),
    badges: normalizeBadges(property.badges),
    listingType: property.listingType,
    visibilityStatus: property.visibilityStatus,
    usage,
    type:
      property.type ||
      getDefaultPropertyTypeForUsage(propertyTypes, usage, property.type),
    area: property.area,
    beds: String(property.beds),
    baths: String(property.baths),
    sqftValue: property.sqft.replace(/\s*sqft$/i, ""),
    lat: String(property.lat),
    lng: String(property.lng),
    description: property.description,
    featuresText: property.features.join("\n"),
    imagesText: property.images.join("\n"),
    yearBuilt: property.yearBuilt ? String(property.yearBuilt) : "",
    parking: property.parking ? String(property.parking) : "",
    furnished: Boolean(property.furnished),
    videoUrl: property.videoUrl ?? "",
    videoThumbnail: property.videoThumbnail ?? "",
    agentId: propertyAgent.id,
  };
}

function normalizeLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function updateTextFromLines(lines: string[]) {
  return lines.join("\n");
}

function serializeFormState(form: PropertyFormState) {
  return JSON.stringify({
    title: form.title,
    location: form.location,
    price: form.price,
    badges: form.badges,
    listingType: form.listingType,
    visibilityStatus: form.visibilityStatus,
    usage: form.usage,
    type: form.type,
    area: form.area,
    beds: form.beds,
    baths: form.baths,
    sqftValue: form.sqftValue,
    lat: form.lat,
    lng: form.lng,
    description: form.description,
    featuresText: form.featuresText,
    imagesText: form.imagesText,
    yearBuilt: form.yearBuilt,
    parking: form.parking,
    furnished: form.furnished,
    videoUrl: form.videoUrl,
    videoThumbnail: form.videoThumbnail,
    agentId: form.agentId,
  });
}

function countChangedFields(
  initial: PropertyFormState,
  current: PropertyFormState,
) {
  const comparableKeys: Array<keyof PropertyFormState> = [
    "title",
    "location",
    "price",
    "badges",
    "listingType",
    "visibilityStatus",
    "usage",
    "type",
    "area",
    "beds",
    "baths",
    "sqftValue",
    "lat",
    "lng",
    "description",
    "featuresText",
    "imagesText",
    "yearBuilt",
    "parking",
    "furnished",
    "videoUrl",
    "videoThumbnail",
    "agentId",
  ];

  return comparableKeys.reduce((count, key) => {
    return initial[key] === current[key] ? count : count + 1;
  }, 0);
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-xl font-bold text-black">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
      {children}
    </label>
  );
}

function FieldLabelOptional({
  children,
  optional,
}: {
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <FieldLabel>{children}</FieldLabel>
      {optional ? (
        <span className="text-[10px] font-bold tracking-[0.18em] text-gray-300 uppercase">
          Optional
        </span>
      ) : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs text-red-600">{message}</p>;
}

function formStateToPayload(form: PropertyFormState): PropertyMutationInput {
  const selectedAgent = getPropertyAgentById(form.agentId);

  return {
    id: form.id,
    title: form.title.trim(),
    location: form.location.trim(),
    price: Number(form.price),
    period: form.listingType === LISTING_TYPES[1] ? "/month" : "",
    beds: Number(form.beds),
    baths: Number(form.baths),
    sqft: `${form.sqftValue.trim()} sqft`,
    images: normalizeLines(form.imagesText),
    badges: normalizeBadges(form.badges),
    type: form.type.trim(),
    listingType: form.listingType,
    visibilityStatus: form.visibilityStatus,
    usage: form.usage,
    area: form.area,
    lat: Number(form.lat),
    lng: Number(form.lng),
    description: form.description.trim(),
    features: normalizeLines(form.featuresText),
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
    parking: form.parking ? Number(form.parking) : undefined,
    furnished: form.furnished,
    videoUrl: form.videoUrl.trim() || undefined,
    videoThumbnail: form.videoThumbnail.trim() || undefined,
    agent: { ...selectedAgent },
  };
}

function prepareFormStateForSave(
  form: PropertyFormState,
  featureDraft: string,
  imageUrlDraft: string,
) {
  const nextFeatures = [
    ...new Set(
      normalizeLines(
        updateTextFromLines([
          ...normalizeLines(form.featuresText),
          featureDraft.trim(),
        ]),
      ),
    ),
  ];

  const nextImages = [
    ...new Set(
      normalizeLines(
        updateTextFromLines([
          ...normalizeLines(form.imagesText),
          imageUrlDraft.trim(),
        ]),
      ),
    ),
  ];

  return {
    ...form,
    featuresText: updateTextFromLines(nextFeatures),
    imagesText: updateTextFromLines(nextImages),
  };
}

function isPositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validatePropertyFormState(form: PropertyFormState): FieldErrorMap {
  const errors: FieldErrorMap = {};

  if (!form.title.trim()) {
    errors.title = "Property title is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!isPositiveNumber(form.price)) {
    errors.price = "Enter a valid price greater than zero.";
  }

  if (!isPositiveNumber(form.beds)) {
    errors.beds = "Enter a valid bedroom count.";
  }

  if (!isPositiveNumber(form.baths)) {
    errors.baths = "Enter a valid bathroom count.";
  }

  if (!isPositiveNumber(form.sqftValue)) {
    errors.sqftValue = "Enter a valid size in sqft.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }

  if (normalizeLines(form.imagesText).length === 0) {
    errors.images = "Add at least one image before publishing.";
  }

  if (!Number.isFinite(Number(form.lat)) || !Number.isFinite(Number(form.lng))) {
    errors.mapPin = "Pick a valid map location for the listing.";
  }

  if (form.videoUrl.trim() && !isValidUrl(form.videoUrl.trim())) {
    errors.videoUrl = "Video URL must be a valid http or https link.";
  }

  if (form.videoThumbnail.trim() && !isValidUrl(form.videoThumbnail.trim())) {
    errors.videoThumbnail = "Video thumbnail URL must be a valid http or https link.";
  }

  return errors;
}

export function AdminPropertyEditor({
  property,
  propertyTypes,
}: AdminPropertyEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialFormState = useMemo(
    () =>
      property
        ? propertyToFormState(property, propertyTypes)
        : createEmptyFormState(propertyTypes),
    [property, propertyTypes],
  );
  const [featureDraft, setFeatureDraft] = useState("");
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [customAreaDraft, setCustomAreaDraft] = useState("");
  const [isAddingCustomArea, setIsAddingCustomArea] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [feedback, setFeedback] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formState, setFormState] = useState<PropertyFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});
  const [isPending, startTransition] = useTransition();
  const propertyTypeOptions = useMemo(
    () =>
      buildPropertyTypeOptions({
        propertyTypes,
        usage: formState.usage,
        fallbackLabels: formState.type ? [formState.type] : [],
      }),
    [formState.type, formState.usage, propertyTypes],
  );
  const areaOptions = useMemo(() => {
    return [...new Set([...AREAS.map((area) => area.name), formState.area].filter(Boolean))];
  }, [formState.area]);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  const featureItems = useMemo(
    () => normalizeLines(formState.featuresText),
    [formState.featuresText],
  );
  const selectedAgent = useMemo(
    () => getPropertyAgentById(formState.agentId),
    [formState.agentId],
  );
  const imageItems = useMemo(
    () => normalizeLines(formState.imagesText),
    [formState.imagesText],
  );
  const slugPreview = buildPropertySlug(formState.title, formState.id);
  const isDirty = serializeFormState(formState) !== serializeFormState(initialFormState);
  const changedFieldsCount = useMemo(
    () => countChangedFields(initialFormState, formState),
    [formState, initialFormState],
  );
  const canSubmit = !isPending && !isUploadingImage && (property ? isDirty : true);
  const primaryActionLabel = isPending
    ? "Saving..."
    : formState.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED
      ? property
        ? isDirty
          ? "Publish Update"
          : "No Changes Yet"
        : "Publish Listing"
      : property
        ? isDirty
          ? "Update Draft"
          : "No Changes Yet"
        : "Save Draft";

  function updateFeatures(next: string[]) {
    setFormState((current) => ({
      ...current,
      featuresText: updateTextFromLines(next),
    }));
  }

  function updateImages(next: string[]) {
    setFormState((current) => ({
      ...current,
      imagesText: updateTextFromLines(next),
    }));
  }

  function addFeature() {
    const value = featureDraft.trim();
    if (!value) return;
    if (!featureItems.includes(value)) updateFeatures([...featureItems, value]);
    setFeatureDraft("");
  }

  function removeFeature(feature: string) {
    updateFeatures(featureItems.filter((entry) => entry !== feature));
  }

  function addImageUrl() {
    const value = imageUrlDraft.trim();
    if (!value) return;
    if (!imageItems.includes(value)) updateImages([...imageItems, value]);
    setImageUrlDraft("");
  }

  function removeImage(image: string) {
    updateImages(imageItems.filter((entry) => entry !== image));
  }

  function applyAreaPreset(areaName: string) {
    const area = AREAS.find((entry) => entry.name === areaName);

    setFormState((current) => ({
      ...current,
      area: areaName,
      location:
        current.location.trim().length === 0 ? `${areaName}, Qatar` : current.location,
      lat: String(area?.center[0] ?? current.lat),
      lng: String(area?.center[1] ?? current.lng),
    }));
  }

  function addCustomArea() {
    const nextArea = customAreaDraft.trim();

    if (!nextArea) {
      return;
    }

    setFormState((current) => ({
      ...current,
      area: nextArea,
      location:
        current.location.trim().length === 0 ? `${nextArea}, Qatar` : current.location,
    }));
    setCustomAreaDraft("");
    setIsAddingCustomArea(false);
  }

  async function searchLocation(query: string) {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(normalizedQuery)}&limit=5`,
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
    setFormState((current) => ({
      ...current,
      location: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon,
    }));
    setLocationSuggestions([]);
  }

  function handleMapLocationChange(next: {
    lat: number;
    lng: number;
    location?: string;
  }) {
    setFormState((current) => ({
      ...current,
      lat: String(next.lat),
      lng: String(next.lng),
      location: next.location ?? current.location,
    }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploadError("");
    setIsUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          success?: boolean;
          url?: string;
          error?: string;
        };

        if (!response.ok || !payload.success || !payload.url) {
          throw new Error(payload.error || "Upload failed.");
        }

        uploadedUrls.push(payload.url);
      }

      updateImages([...imageItems, ...uploadedUrls.filter(Boolean)]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
      if (event.target) event.target.value = "";
    }
  }

  function submitListing(nextVisibilityStatus?: Property["visibilityStatus"]) {
    setFeedback("");
    setUploadError("");
    const preparedFormState = prepareFormStateForSave(
      {
        ...formState,
        visibilityStatus: nextVisibilityStatus ?? formState.visibilityStatus,
      },
      featureDraft,
      imageUrlDraft,
    );
    const validationErrors = validatePropertyFormState(preparedFormState);

    setFormState(preparedFormState);
    setFeatureDraft("");
    setImageUrlDraft("");

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFeedback("Please resolve the highlighted fields before saving.");
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      try {
        await savePropertyAction(formStateToPayload(preparedFormState));
        router.push("/admin/listings");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to save listing.",
        );
      }
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitListing();
  }

  function toggleBadge(badge: string) {
    setFormState((current) => {
      const isSelected = current.badges.includes(badge);

      if (isSelected) {
        return {
          ...current,
          badges: normalizeBadges(
            current.badges.filter((currentBadge) => currentBadge !== badge),
          ),
        };
      }

      if (badge === "NEW") {
        return {
          ...current,
          badges: ["NEW"],
        };
      }

      return {
        ...current,
        badges: normalizeBadges(
          current.badges
            .filter((currentBadge) => currentBadge !== "NEW")
            .concat(badge),
        ),
      };
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 pb-40 xl:grid-cols-[minmax(0,1fr)_380px] xl:pb-0"
    >
      <div className="space-y-6">
        <div
          className={cn(
            "rounded-[1.6rem] border px-5 py-4 shadow-sm",
            isDirty
              ? "border-accent/20 bg-accent/5"
              : "border-black/5 bg-white",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                isDirty ? "bg-accent/12 text-accent" : "bg-gray-100 text-gray-400",
              )}
            >
              <AlertCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">
                {property
                  ? isDirty
                    ? `${changedFieldsCount} change${changedFieldsCount === 1 ? "" : "s"} ready to update`
                    : "No unsaved changes"
                  : "Prepare and publish the new listing"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {property
                  ? isDirty
                    ? "Your edits are local until you confirm the update."
                    : "Edit any field, media item, or map position to enable update emphasis."
                  : "Complete the essentials, then publish it live to the shared catalog."}
              </p>
            </div>
          </div>
        </div>

        {feedback ? (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {feedback}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm md:p-7">
          <SectionHeading
            eyebrow="Basic Information"
            title="Core Listing Setup"
            description="Build the main listing identity first: title, exact location, pricing, structural details, and the map pin."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabelOptional>Property Title</FieldLabelOptional>
              <input
                required
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Property title"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.title ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.title} />
            </div>
            <div className="relative">
              <FieldLabelOptional>Location</FieldLabelOptional>
              <input
                required
                value={formState.location}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setFormState((current) => ({
                    ...current,
                    location: nextValue,
                  }));
                  void searchLocation(nextValue);
                }}
                placeholder="Location"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.location ? "border-red-300" : "border-gray-200",
                )}
              />
              {isSearchingLocation ? (
                <LoaderCircle className="absolute top-[calc(50%+12px)] right-4 h-4 w-4 -translate-y-1/2 animate-spin text-accent" />
              ) : null}
              {locationSuggestions.length > 0 ? (
                <div className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
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
              <FieldError message={fieldErrors.location} />
            </div>
            <div>
              <FieldLabelOptional>Price</FieldLabelOptional>
              <input
                required
                type="number"
                value={formState.price}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="Price"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.price ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.price} />
            </div>
            <div>
              <FieldLabel>Listing Type</FieldLabel>
              <select
                value={formState.listingType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    listingType: event.target.value as Property["listingType"],
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {LISTING_TYPES.map((listingType) => (
                  <option key={listingType} value={listingType}>
                    {LISTING_TYPE_META[listingType].actionLabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Site Visibility</FieldLabel>
              <select
                value={formState.visibilityStatus}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    visibilityStatus: event.target.value as Property["visibilityStatus"],
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {PROPERTY_VISIBILITY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PROPERTY_VISIBILITY_META[status].adminLabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Usage</FieldLabel>
              <select
                value={formState.usage}
                onChange={(event) =>
                  setFormState((current) => {
                    const nextUsage = event.target.value as Property["usage"];
                    const nextUsageOptions = buildPropertyTypeOptions({
                      propertyTypes,
                      usage: nextUsage,
                    });
                    const nextType = nextUsageOptions.includes(current.type)
                      ? current.type
                      : getDefaultPropertyTypeForUsage(
                          propertyTypes,
                          nextUsage,
                          current.type,
                        );

                    return {
                      ...current,
                      usage: nextUsage,
                      type: nextType,
                    };
                  })
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {PROPERTY_USAGES.map((usageOption) => (
                  <option key={usageOption} value={usageOption}>
                    {PROPERTY_USAGE_META[usageOption].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Listing Status</FieldLabel>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {LISTING_BADGE_OPTIONS.map((option) => {
                  const isSelected = formState.badges.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleBadge(option.value)}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-4 text-left transition-all",
                        isSelected
                          ? "border-accent bg-accent/6 shadow-sm"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isSelected ? "text-black" : "text-gray-700",
                            )}
                          >
                            {option.label}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500">
                            {option.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                            isSelected
                              ? "bg-accent text-white"
                              : "bg-white text-gray-400",
                          )}
                        >
                          {isSelected ? "On" : "Off"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <FieldLabel>Property Type</FieldLabel>
              <select
                value={formState.type}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {propertyTypeOptions.map((propertyType) => (
                  <option key={propertyType}>{propertyType}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Area</FieldLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={formState.area}
                    onChange={(event) => applyAreaPreset(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  >
                    {areaOptions.map((areaName) => (
                      <option key={areaName} value={areaName}>
                        {areaName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomArea((current) => !current)}
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center rounded-2xl border px-4 py-3 transition-all",
                      isAddingCustomArea
                        ? "border-accent bg-accent text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black",
                    )}
                    aria-label="Add custom area"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {isAddingCustomArea ? (
                  <div className="flex gap-2">
                    <input
                      value={customAreaDraft}
                      onChange={(event) => setCustomAreaDraft(event.target.value)}
                      placeholder="Add custom area or district"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={addCustomArea}
                      className="rounded-2xl bg-black px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-white uppercase transition-all hover:bg-accent"
                    >
                      Add
                    </button>
                  </div>
                ) : null}
                <p className="text-xs text-gray-500">
                  Choose an existing area like The Pearl or Lusail, or add a custom one directly here.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 overflow-hidden rounded-[1.7rem] border border-gray-100 bg-gray-50/70 p-4">
              <FieldLabelOptional>Pin Location On Map</FieldLabelOptional>
              <AdminLocationPickerMap
                lat={Number(formState.lat)}
                lng={Number(formState.lng)}
                onChange={handleMapLocationChange}
              />
              <p className="mt-3 text-xs text-gray-500">
                Search a location or click directly on the map to drop the listing pin and update the address. Coordinates are managed automatically from the selected pin.
              </p>
              <FieldError message={fieldErrors.mapPin} />
            </div>

            <div>
              <FieldLabelOptional>Bedrooms</FieldLabelOptional>
              <input
                required
                type="number"
                value={formState.beds}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    beds: event.target.value,
                  }))
                }
                placeholder="Bedrooms"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.beds ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.beds} />
            </div>
            <div>
              <FieldLabelOptional>Bathrooms</FieldLabelOptional>
              <input
                required
                type="number"
                value={formState.baths}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    baths: event.target.value,
                  }))
                }
                placeholder="Bathrooms"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.baths ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.baths} />
            </div>
            <div>
              <FieldLabelOptional>Size</FieldLabelOptional>
              <input
                required
                type="number"
                value={formState.sqftValue}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    sqftValue: event.target.value,
                  }))
                }
                placeholder="Sqft"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.sqftValue ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.sqftValue} />
            </div>
            <div>
              <FieldLabelOptional optional>Year Built</FieldLabelOptional>
              <input
                type="number"
                value={formState.yearBuilt}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    yearBuilt: event.target.value,
                  }))
                }
                placeholder="Year built"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <div>
              <FieldLabelOptional optional>Parking Spaces</FieldLabelOptional>
              <input
                type="number"
                value={formState.parking}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    parking: event.target.value,
                  }))
                }
                placeholder="Parking spaces"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <div>
              <FieldLabelOptional optional>Furnished</FieldLabelOptional>
              <ToggleSwitch
                label="Furnished Status"
                description="Use this for move-in ready listings or homes offered with furniture included."
                checked={formState.furnished}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    furnished: checked,
                  }))
                }
                onLabel="Furnished"
                offLabel="Unfurnished"
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabelOptional>Description</FieldLabelOptional>
              <textarea
                required
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
                rows={5}
                className={cn(
                  "w-full rounded-[1.5rem] border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.description ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.description} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm md:p-7">
          <SectionHeading
            eyebrow="Features"
            title="Features & Amenities"
            description="Keep the scannable benefits concise and strong."
          />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={featureDraft}
              onChange={(event) => setFeatureDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addFeature();
                }
              }}
              placeholder="Add a feature"
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addFeature}
              className="rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent sm:w-auto"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {featureItems.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="text-gray-400 transition-colors hover:text-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm md:p-7">
          <SectionHeading
            eyebrow="Media"
            title="Images & Video"
            description="Upload directly to R2 or add external assets when you need to move quickly."
          />
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isUploadingImage ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Images
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={imageUrlDraft}
              onChange={(event) => setImageUrlDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addImageUrl();
                }
              }}
              placeholder="Paste image URL"
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent sm:w-auto"
            >
              Add URL
            </button>
          </div>

          <FieldError message={fieldErrors.images} />

          {uploadError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {uploadError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {imageItems.map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-gray-50"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt="Property upload preview"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="truncate text-xs text-gray-500">{image}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="shrink-0 rounded-full border border-gray-200 p-2 text-gray-400 transition-colors hover:text-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {imageItems.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
                <ImagePlus className="h-7 w-7" />
                <p className="mt-3 text-xs leading-relaxed">
                  Upload an image to R2 or paste a direct URL.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabelOptional optional>Video URL</FieldLabelOptional>
              <input
                value={formState.videoUrl}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    videoUrl: event.target.value,
                  }))
                }
                placeholder="Video URL"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.videoUrl ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.videoUrl} />
            </div>
            <div>
              <FieldLabelOptional optional>Video Thumbnail URL</FieldLabelOptional>
              <input
                value={formState.videoThumbnail}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    videoThumbnail: event.target.value,
                  }))
                }
                placeholder="Video thumbnail URL"
                className={cn(
                  "w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent",
                  fieldErrors.videoThumbnail ? "border-red-300" : "border-gray-200",
                )}
              />
              <FieldError message={fieldErrors.videoThumbnail} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm md:p-7">
          <SectionHeading
            eyebrow="Agent"
            title="Assigned Consultant"
            description="Choose which agent profile should appear across the listing and property detail page."
          />

          <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            <div>
              <FieldLabel>Listing Agent</FieldLabel>
              <select
                value={formState.agentId}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    agentId: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {PROPERTY_AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[1.6rem] border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedAgent.image}
                  alt={selectedAgent.name}
                  className="h-16 w-16 rounded-full object-cover object-top"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-black">{selectedAgent.name}</p>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.22em] text-accent uppercase">
                    {selectedAgent.role}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p>{selectedAgent.email}</p>
                    <p>{selectedAgent.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
          <SectionHeading
            eyebrow="Publish"
            title="Ready To Push Live"
            description="Choose whether this listing should stay hidden as a draft or go live on the public website."
          />
          <div className="mt-4 space-y-4">
            {feedback ? (
              <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {feedback}
              </div>
            ) : null}
            <div className="rounded-[1.5rem] bg-gray-50 p-4">
              <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                Slug Preview
              </p>
              <p className="mt-2 break-all text-sm text-black">
                /properties/{slugPreview}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-gray-50 p-4">
              <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                Current Visibility
              </p>
              <p className="mt-2 text-sm font-semibold text-black">
                {PROPERTY_VISIBILITY_META[formState.visibilityStatus].adminLabel}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {PROPERTY_VISIBILITY_META[formState.visibilityStatus].publicLabel}
              </p>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => submitListing(PROPERTY_VISIBILITY_DRAFT)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-black uppercase transition-all hover:border-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending && formState.visibilityStatus === PROPERTY_VISIBILITY_DRAFT ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[10px] font-bold tracking-[0.22em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-60",
                  property
                    ? isDirty
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "bg-gray-200 text-gray-500"
                    : "bg-black text-white hover:bg-accent",
                )}
              >
                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {primaryActionLabel}
              </button>
            </div>

            <p className="text-xs leading-relaxed text-gray-500">
              Published listings appear across the website. Draft listings stay
              available only in admin until you decide to make them live.
            </p>
          </div>
        </div>

      </aside>

      <div className="fixed right-4 bottom-28 left-4 z-40 xl:hidden">
        <div className="rounded-[1.5rem] border border-black/8 bg-white px-4 py-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                {property ? "Update Status" : "Publish Status"}
              </p>
              <p className="mt-1 text-sm font-semibold text-black">
                {property
                  ? isDirty
                    ? `${changedFieldsCount} change${changedFieldsCount === 1 ? "" : "s"} ready`
                    : "No changes yet"
                  : "Ready when core details are complete"}
              </p>
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "shrink-0 rounded-full px-4 py-3 text-[10px] font-bold tracking-[0.18em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-60",
                property
                  ? isDirty
                    ? "bg-accent text-white"
                    : "bg-gray-200 text-gray-500"
                  : "bg-black text-white",
              )}
            >
              {isPending ? "Saving..." : property ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
