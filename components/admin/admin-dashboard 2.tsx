'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BedDouble,
  Building2,
  Edit3,
  Eye,
  Home,
  LogOut,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  deletePropertyAction,
  logoutAdmin,
  savePropertyAction,
} from "@/app/actions";
import { AREAS } from "@/data/properties";
import { getPropertyUsage } from "@/lib/property-formatting";
import { buildPropertySlug } from "@/lib/property-slug";
import { formatPrice } from "@/lib/property-formatting";
import { siteEmail, sitePhone, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  PROPERTY_USAGE_RESIDENTIAL,
  PROPERTY_VISIBILITY_PUBLISHED,
  type Property,
  type PropertyMutationInput,
} from "@/types/property";

interface AdminDashboardProps {
  properties: Property[];
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
    agentName: "Rise Property Advisor",
    agentRole: "Senior Property Consultant",
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
    images: form.imagesText
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
    badges: buildBadges(price, listingType),
    type: form.type.trim(),
    listingType,
    visibilityStatus: form.visibilityStatus,
    usage: form.usage,
    area: form.area,
    lat: Number(form.lat),
    lng: Number(form.lng),
    description: form.description.trim(),
    features: form.featuresText
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
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
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [items, setItems] = useState(properties);
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<PropertyFormState>(
    createEmptyFormState(),
  );
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(properties);
  }, [properties]);

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
      {
        label: "Total Listings",
        value: String(items.length),
        icon: Building2,
      },
      {
        label: "For Sale",
        value: String(buyCount),
        icon: Home,
      },
      {
        label: "For Rent",
        value: String(rentCount),
        icon: BedDouble,
      },
      {
        label: "Featured",
        value: String(featuredCount),
        icon: BarChart3,
      },
    ];
  }, [items]);

  const slugPreview = buildPropertySlug(formState.title, formState.id);

  function resetForm() {
    setFormState(createEmptyFormState());
    setFeedback("");
  }

  function startCreateFlow() {
    resetForm();
    setActiveTab("editor");
  }

  function startEditFlow(property: Property) {
    setFormState(propertyToFormState(property));
    setFeedback("");
    setActiveTab("editor");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

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
        setActiveTab("listings");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to save listing.",
        );
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
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to delete listing.",
        );
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
              Neon Source
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Properties are seeded from mock data once and then served from your
              Neon Postgres database.
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
                      ? "Edit Listing"
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
            <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
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
                            {property.title}
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
                    Jump into a new listing
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    Create a property, seed it into Neon, and it will appear on
                    the homepage, listings, and single-property pages.
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
                                {property.title}
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
              className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
            >
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                        Listing Details
                      </p>
                      <h3 className="mt-2 text-xl font-display font-bold text-black">
                        Core Information
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
                    <input
                      required
                      value={formState.location}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      placeholder="Location"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                      value={formState.type}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Penthouse</option>
                      <option>Office</option>
                    </select>
                    <select
                      value={formState.area}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          area: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    >
                      {AREAS.map((area) => (
                        <option key={area.name} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                    </select>
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
                    <div className="grid grid-cols-2 gap-3">
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
                    Media & Features
                  </p>
                  <div className="mt-6 grid gap-4">
                    <textarea
                      value={formState.featuresText}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          featuresText: event.target.value,
                        }))
                      }
                      placeholder="One feature per line"
                      rows={6}
                      className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
                    <textarea
                      value={formState.imagesText}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          imagesText: event.target.value,
                        }))
                      }
                      placeholder="One image URL per line"
                      rows={6}
                      className="rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-accent"
                    />
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
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                      Public path updates automatically after save. Homepage,
                      listing pages and property detail pages all revalidate from
                      the same Neon-backed store.
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {isPending ? "Saving..." : formState.id ? "Update Listing" : "Publish Listing"}
                    </button>
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
