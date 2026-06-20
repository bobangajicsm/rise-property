'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  Building2,
  Edit3,
  Eye,
  Home,
  ImagePlus,
  LoaderCircle,
  LogOut,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deletePropertyAction,
  logoutAdmin,
  savePropertyAction,
} from "@/app/actions";
import { MapLoading } from "@/components/maps/map-loading";
import { AREAS } from "@/data/properties";
import { inferPropertyUsageFromTypeLabel } from "@/lib/property-types";
import { getPropertyUsage } from "@/lib/property-formatting";
import { buildPropertySlug } from "@/lib/property-slug";
import { formatPrice } from "@/lib/property-formatting";
import {
  defaultPropertyAgent,
  siteEmail,
  sitePhone,
  whatsappUrl,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  PROPERTY_USAGE_COMMERCIAL,
  PROPERTY_USAGE_INTERNATIONAL,
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
  PROPERTY_USAGE_RESIDENTIAL,
  PROPERTY_VISIBILITY_PUBLISHED,
  type Property,
  type PropertyMutationInput,
} from "@/types/property";

interface AdminDashboardProps {
  properties: Property[];
}

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
  agentName: string;
  agentRole: string;
  agentImage: string;
  agentPhone: string;
  agentEmail: string;
  agentWhatsapp: string;
}

type AdminTab = "dashboard" | "listings" | "editor";

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

const RESIDENTIAL_PROPERTY_TYPES = ["Apartment", "Villa", "Penthouse"] as const;
const COMMERCIAL_PROPERTY_TYPES = ["Office", "Shop"] as const;
const INTERNATIONAL_PROPERTY_TYPES = ["International Property"] as const;

function createEmptyFormState(): PropertyFormState {
  return {
    title: "",
    location: "",
    price: "",
    listingType: "buy",
    visibilityStatus: PROPERTY_VISIBILITY_PUBLISHED,
    usage: PROPERTY_USAGE_RESIDENTIAL,
    type: "Apartment",
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
    agentName: defaultPropertyAgent.name,
    agentRole: defaultPropertyAgent.role,
    agentImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    agentPhone: sitePhone,
    agentEmail: siteEmail,
    agentWhatsapp: whatsappUrl,
  };
}

function propertyToFormState(property: Property): PropertyFormState {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    price: String(property.price),
    listingType: property.listingType,
    visibilityStatus: property.visibilityStatus,
    usage: property.usage ?? getPropertyUsage(property),
    type: property.type,
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
    agentName: property.agent.name,
    agentRole: property.agent.role,
    agentImage: property.agent.image,
    agentPhone: property.agent.phone,
    agentEmail: property.agent.email ?? siteEmail,
    agentWhatsapp: property.agent.whatsapp ?? whatsappUrl,
  };
}

function buildBadges(price: number, listingType: Property["listingType"]) {
  return price > 10_000_000 || (listingType === "rent" && price > 25_000)
    ? ["FEATURED", "LUXURY"]
    : ["NEW"];
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

function formStateToPayload(form: PropertyFormState): PropertyMutationInput {
  const price = Number(form.price);
  const listingType = form.listingType;

  return {
    id: form.id,
    title: form.title.trim(),
    location: form.location.trim(),
    price,
    period: listingType === "rent" ? "/month" : "",
    beds: Number(form.beds),
    baths: Number(form.baths),
    sqft: `${form.sqftValue.trim()} sqft`,
    images: normalizeLines(form.imagesText),
    badges: buildBadges(price, listingType),
    type: form.type.trim(),
    listingType,
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
    agent: {
      name: form.agentName.trim(),
      role: form.agentRole.trim(),
      image: form.agentImage.trim(),
      phone: form.agentPhone.trim(),
      email: form.agentEmail.trim(),
      whatsapp: form.agentWhatsapp.trim(),
    },
  };
}

export function AdminDashboard({ properties }: AdminDashboardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [items, setItems] = useState(properties);
  const [search, setSearch] = useState("");
  const [featureDraft, setFeatureDraft] = useState("");
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [feedback, setFeedback] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">(
    "success",
  );
  const [formState, setFormState] = useState<PropertyFormState>(
    createEmptyFormState(),
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(properties);
  }, [properties]);

  const featureItems = useMemo(
    () => normalizeLines(formState.featuresText),
    [formState.featuresText],
  );
  const imageItems = useMemo(
    () => normalizeLines(formState.imagesText),
    [formState.imagesText],
  );

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((property) =>
      [
        property.title,
        property.location,
        property.area,
        property.type,
        property.slug,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const buyCount = items.filter((property) => property.listingType === "buy").length;
    const rentCount = items.filter((property) => property.listingType === "rent").length;
    const featuredCount = items.filter((property) =>
      property.badges.includes("FEATURED"),
    ).length;

    return [
      { label: "Total Listings", value: String(items.length), icon: Building2 },
      { label: "For Sale", value: String(buyCount), icon: Home },
      { label: "For Rent", value: String(rentCount), icon: BedDouble },
      { label: "Featured", value: String(featuredCount), icon: BarChart3 },
    ];
  }, [items]);

  const slugPreview = buildPropertySlug(formState.title, formState.id);

  function resetForm() {
    setFormState(createEmptyFormState());
    setFeatureDraft("");
    setImageUrlDraft("");
    setLocationSuggestions([]);
    setFeedback("");
    setFeedbackTone("success");
    setUploadError("");
  }

  function startCreateFlow() {
    resetForm();
    setActiveTab("editor");
  }

  function startEditFlow(property: Property) {
    setFormState(propertyToFormState(property));
    setFeatureDraft("");
    setImageUrlDraft("");
    setLocationSuggestions([]);
    setFeedback("");
    setFeedbackTone("success");
    setUploadError("");
    setActiveTab("editor");
  }

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
    if (!value) {
      return;
    }

    if (!featureItems.includes(value)) {
      updateFeatures([...featureItems, value]);
    }
    setFeatureDraft("");
  }

  function removeFeature(feature: string) {
    updateFeatures(featureItems.filter((entry) => entry !== feature));
  }

  function addImageUrl() {
    const value = imageUrlDraft.trim();
    if (!value) {
      return;
    }

    if (!imageItems.includes(value)) {
      updateImages([...imageItems, value]);
    }
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

    if (!files.length) {
      return;
    }

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
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setFeedbackTone("success");

    startTransition(async () => {
      try {
        const savedProperty = await savePropertyAction(formStateToPayload(formState));

        setItems((current) => {
          const existingIndex = current.findIndex(
            (property) => property.id === savedProperty.id,
          );

          if (existingIndex === -1) {
            return [savedProperty, ...current];
          }

          const next = [...current];
          next[existingIndex] = savedProperty;
          return next;
        });

        setFormState(propertyToFormState(savedProperty));
        setFeedback("Listing saved successfully.");
        setFeedbackTone("success");
        setActiveTab("listings");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to save listing.",
        );
        setFeedbackTone("error");
      }
    });
  }

  function handleDelete(property: Property) {
    if (!window.confirm(`Delete "${property.title}"?`)) {
      return;
    }

    setFeedback("");

    startTransition(async () => {
      try {
        await deletePropertyAction(property.id);
        setItems((current) =>
          current.filter((entry) => entry.id !== property.id),
        );
        if (formState.id === property.id) {
          resetForm();
        }
        setFeedback(`Deleted "${property.title}".`);
        setFeedbackTone("success");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to delete listing.",
        );
        setFeedbackTone("error");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-black/5 bg-white p-6 lg:p-8">
          <div className="rounded-[2rem] bg-black p-6 text-white">
            <p className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
              Rise Admin
            </p>
            <h1 className="mt-3 text-2xl font-display font-bold">
              Listings Control
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Manage everything from one place and publish straight to the live
              public site.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            {[
              { key: "dashboard", label: "Dashboard", icon: BarChart3 },
              { key: "listings", label: "All Listings", icon: Building2 },
              { key: "editor", label: "Add / Edit", icon: Plus },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key as AdminTab)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/20"
                      : "text-gray-500 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Infra
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Listings are stored in Neon, and image uploads go through your
              secured admin route into R2 when storage is configured in
              <span className="font-mono text-[12px]"> .env.local</span>.
            </p>
          </div>

          <form action={logoutAdmin} className="mt-8">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-[11px] font-bold tracking-[0.22em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </form>
        </aside>

        <main className="p-6 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                Control Center
              </p>
              <h2 className="mt-2 text-3xl font-display font-bold text-black">
                {activeTab === "dashboard"
                  ? "Overview"
                  : activeTab === "listings"
                    ? "Manage Listings"
                    : formState.id
                      ? `Edit Listing #${formState.id}`
                      : "Create Listing"}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("listings")}
                className="rounded-full border border-gray-200 px-5 py-2 text-[10px] font-bold tracking-[0.22em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
              >
                View Listings
              </button>
              <button
                type="button"
                onClick={startCreateFlow}
                className="rounded-full bg-black px-5 py-2 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
              >
                New Listing
              </button>
            </div>
          </div>

          {feedback ? (
            <div
              className={cn(
                "mb-6 rounded-2xl px-5 py-4 text-sm",
                feedbackTone === "success"
                  ? "border border-accent/20 bg-accent/5 text-gray-600"
                  : "border border-red-200 bg-red-50 text-red-700",
              )}
            >
              {feedback}
            </div>
          ) : null}

          {activeTab === "dashboard" ? (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                          Live
                        </span>
                      </div>
                      <p className="mt-6 text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-3xl font-display font-bold text-black">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-black">
                      Latest Listings
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("listings")}
                      className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {items.slice(0, 6).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
                      >
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-16 w-16 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-black">
                            #{property.id} {property.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {property.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black">
                            QAR {formatPrice(property.price)}
                          </p>
                          <p className="text-[10px] tracking-widest text-gray-400 uppercase">
                            {property.listingType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Quick Publish
                  </p>
                  <h3 className="mt-3 text-2xl font-display font-bold text-black">
                    Better listing creation
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    Upload images to R2, build out features, save once, and the
                    public website updates from the same data source.
                  </p>
                  <button
                    type="button"
                    onClick={startCreateFlow}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                    Add Listing
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "listings" ? (
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search listings, area, slug or location"
                    className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none focus:border-accent"
                  />
                </div>
                <button
                  type="button"
                  onClick={startCreateFlow}
                  className="rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
                >
                  Add New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                      <th className="px-2 py-4">Property</th>
                      <th className="px-2 py-4">Type</th>
                      <th className="px-2 py-4">Area</th>
                      <th className="px-2 py-4">Price</th>
                      <th className="px-2 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr key={property.id} className="border-b border-gray-50">
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="h-14 w-14 rounded-2xl object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-black">
                                #{property.id} {property.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {property.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                            {property.listingType} / {property.type}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-600">
                          {property.area}
                        </td>
                        <td className="px-2 py-4 text-sm font-semibold text-black">
                          QAR {formatPrice(property.price)}
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/properties/${property.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => startEditFlow(property)}
                              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(property)}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase transition-all hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === "editor" ? (
            <form
              onSubmit={handleSubmit}
              className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
            >
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                        Basic Information
                      </p>
                      <h3 className="mt-2 text-xl font-display font-bold text-black">
                        Core Listing Setup
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.22em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <div className="relative">
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
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none focus:border-accent"
                      />
                      {isSearchingLocation ? (
                        <LoaderCircle className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-accent" />
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
                    </div>
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <select
                      value={formState.listingType}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          listingType: event.target.value as Property["listingType"],
                        }))
                      }
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      <option value="buy">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                    <select
                      value={formState.usage}
                      onChange={(event) =>
                        setFormState((current) => {
                          const nextUsage = event.target.value as Property["usage"];
                          const nextType =
                            nextUsage === PROPERTY_USAGE_COMMERCIAL
                              ? COMMERCIAL_PROPERTY_TYPES[0]
                              : nextUsage === PROPERTY_USAGE_INTERNATIONAL
                                ? INTERNATIONAL_PROPERTY_TYPES[0]
                                : inferPropertyUsageFromTypeLabel(current.type) === PROPERTY_USAGE_COMMERCIAL
                                ? RESIDENTIAL_PROPERTY_TYPES[0]
                                : current.type;

                          return {
                            ...current,
                            usage: nextUsage,
                            type: nextType,
                          };
                        })
                      }
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      {PROPERTY_USAGES.map((usageOption) => (
                        <option key={usageOption} value={usageOption}>
                          {PROPERTY_USAGE_META[usageOption].label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formState.type}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          type: event.target.value,
                          usage: inferPropertyUsageFromTypeLabel(event.target.value),
                        }))
                      }
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      {(formState.usage === PROPERTY_USAGE_COMMERCIAL
                        ? COMMERCIAL_PROPERTY_TYPES
                        : formState.usage === PROPERTY_USAGE_INTERNATIONAL
                          ? INTERNATIONAL_PROPERTY_TYPES
                          : RESIDENTIAL_PROPERTY_TYPES
                      ).map((propertyType) => (
                        <option key={propertyType}>{propertyType}</option>
                      ))}
                    </select>
                    <select
                      value={formState.area}
                      onChange={(event) => applyAreaPreset(event.target.value)}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      {AREAS.map((area) => (
                        <option key={area.name} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                    <div className="md:col-span-2">
                      <p className="mb-3 text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                        Pin Location On Map
                      </p>
                      <AdminLocationPickerMap
                        lat={Number(formState.lat)}
                        lng={Number(formState.lng)}
                        onChange={handleMapLocationChange}
                      />
                      <p className="mt-3 text-xs text-gray-500">
                        Search a location or click directly on the map to drop the listing pin and update the address.
                      </p>
                    </div>
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formState.furnished}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            furnished: event.target.checked,
                          }))
                        }
                      />
                      Furnished
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:col-span-2">
                      <input
                        required
                        type="number"
                        step="any"
                        value={formState.lat}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            lat: event.target.value,
                          }))
                        }
                        placeholder="Latitude"
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                      />
                      <input
                        required
                        type="number"
                        step="any"
                        value={formState.lng}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            lng: event.target.value,
                          }))
                        }
                        placeholder="Longitude"
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                      />
                    </div>
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
                      className="md:col-span-2 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Features
                  </p>

                  <div className="mt-5 flex gap-2">
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
                      className="rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
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

                <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                        Media
                      </p>
                      <h3 className="mt-2 text-xl font-display font-bold text-black">
                        Images & Video
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Images
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
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
                      className="rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
                    >
                      Add URL
                    </button>
                  </div>

                  {uploadError ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {uploadError}
                    </div>
                  ) : null}

                  <p className="mt-4 text-xs leading-relaxed text-gray-500">
                    Upload directly to your R2 bucket through the secured admin
                    route, or paste an existing image URL below.
                  </p>

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
                          <span className="truncate text-xs text-gray-500">
                            {image}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="shrink-0 rounded-full border border-gray-200 p-2 text-gray-400 transition-colors hover:text-black"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {imageItems.length === 0 ? (
                      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
                        <ImagePlus className="h-7 w-7" />
                        <p className="mt-3 text-xs leading-relaxed">
                          Upload an image to R2 or paste a direct URL.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={formState.videoUrl}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          videoUrl: event.target.value,
                        }))
                      }
                      placeholder="Video URL"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.videoThumbnail}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          videoThumbnail: event.target.value,
                        }))
                      }
                      placeholder="Video thumbnail URL"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Agent
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={formState.agentName}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentName: event.target.value,
                        }))
                      }
                      placeholder="Agent name"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.agentRole}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentRole: event.target.value,
                        }))
                      }
                      placeholder="Agent role"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.agentPhone}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentPhone: event.target.value,
                        }))
                      }
                      placeholder="Agent phone"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.agentEmail}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentEmail: event.target.value,
                        }))
                      }
                      placeholder="Agent email"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.agentWhatsapp}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentWhatsapp: event.target.value,
                        }))
                      }
                      placeholder="Agent WhatsApp URL"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={formState.agentImage}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          agentImage: event.target.value,
                        }))
                      }
                      placeholder="Agent image URL"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Publish
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1.5rem] bg-gray-50 p-4">
                      <p className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                        Slug Preview
                      </p>
                      <p className="mt-2 break-all text-sm text-black">
                        /properties/{slugPreview}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-gray-50 p-4 text-sm leading-relaxed text-gray-500">
                      Public routes pull from the same Neon-backed store, so
                      changes here update home sections, listing pages and single
                      property pages after save.
                    </div>

                    <button
                      type="submit"
                      disabled={isPending || isUploadingImage}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isPending
                        ? "Saving..."
                        : formState.id
                          ? "Update Listing"
                          : "Publish Listing"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Area Presets
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {AREAS.map((area) => (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => applyAreaPreset(area.name)}
                        className={cn(
                          "rounded-full border px-3 py-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all",
                          formState.area === area.name
                            ? "border-accent bg-accent text-white"
                            : "border-gray-200 text-gray-600 hover:border-black hover:text-black",
                        )}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Geo
                  </p>
                  <div className="mt-4 flex items-start gap-3 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                    <p>
                      Lat {formState.lat || "-"} / Lng {formState.lng || "-"}
                    </p>
                  </div>
                </div>
              </aside>
            </form>
          ) : null}
        </main>
      </div>
    </div>
  );
}
