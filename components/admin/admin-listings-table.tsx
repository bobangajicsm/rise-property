'use client';

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Plus, Search, Trash2 } from "lucide-react";
import { deletePropertyAction } from "@/app/actions";
import { formatPrice } from "@/lib/property-formatting";
import {
  PROPERTY_VISIBILITY_META,
  PROPERTY_VISIBILITY_PUBLISHED,
  type Property,
} from "@/types/property";

interface AdminListingsTableProps {
  properties: Property[];
}

export function AdminListingsTable({ properties }: AdminListingsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | Property["visibilityStatus"]>("all");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesVisibility =
        visibilityFilter === "all" || property.visibilityStatus === visibilityFilter;
      const matchesSearch =
        !query ||
        [
          property.title,
          property.location,
          property.area,
          property.type,
          property.slug,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesVisibility && matchesSearch;
    });
  }, [properties, search, visibilityFilter]);

  const stats = useMemo(() => {
    const publishedCount = properties.filter(
      (property) => property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED,
    ).length;
    const draftCount = properties.length - publishedCount;
    const buyCount = properties.filter((property) => property.listingType === "buy").length;
    const rentCount = properties.filter((property) => property.listingType === "rent").length;

    return [
      { label: "Published", value: String(publishedCount) },
      { label: "Drafts", value: String(draftCount) },
      { label: "For Sale", value: String(buyCount) },
      { label: "For Rent", value: String(rentCount) },
    ];
  }, [properties]);

  function handleDelete(property: Property) {
    if (!window.confirm(`Delete "${property.title}"?`)) {
      return;
    }

    setFeedback("");

    startTransition(async () => {
      try {
        await deletePropertyAction(property.id);
        setFeedback(`Deleted "${property.title}".`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to delete listing.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.7rem] border border-black/5 bg-white px-5 py-5 shadow-sm"
          >
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              {stat.label}
            </p>
            <p className="mt-3 font-display text-3xl font-bold text-black">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search listings, area, slug or location"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={visibilityFilter}
              onChange={(event) =>
                setVisibilityFilter(
                  event.target.value as "all" | Property["visibilityStatus"],
                )
              }
              className="rounded-full border border-gray-200 bg-white px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Listings</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <div className="rounded-full bg-gray-100 px-4 py-3 text-center text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase">
              {filteredProperties.length} Results
            </div>
            <Link
              href="/admin/listings/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Link>
          </div>
        </div>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
            {feedback}
          </div>
        ) : null}

        <div className="mt-6 hidden overflow-hidden rounded-[1.6rem] border border-gray-100 xl:block">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50/80">
              <tr className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Visibility</th>
                <th className="px-5 py-4">Area</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property.id} className="border-t border-gray-100 bg-white">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-16 w-16 rounded-[1.2rem] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-black">
                          #{property.id} {property.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{property.location}</p>
                        <p className="mt-1 text-[10px] tracking-wider text-gray-400 uppercase">
                          /properties/{property.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                      {property.listingType} / {property.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase ${
                        property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {PROPERTY_VISIBILITY_META[property.visibilityStatus].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{property.area}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-black">
                    QAR {formatPrice(property.price)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/properties/${property.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/admin/listings/${property.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(property)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase transition-all hover:bg-red-50 disabled:opacity-60"
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

        <div className="mt-6 grid gap-4 xl:hidden">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="overflow-hidden rounded-[1.6rem] border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-20 w-20 rounded-[1.2rem] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-black">
                    #{property.id} {property.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{property.location}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                      {property.listingType}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                      {property.type}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                      {property.area}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase ${
                        property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {PROPERTY_VISIBILITY_META[property.visibilityStatus].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-black">
                  QAR {formatPrice(property.price)}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/admin/listings/${property.id}`}
                    className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(property)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-3 py-2 text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase transition-all hover:bg-red-50 disabled:opacity-60 sm:w-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-black">No listings found</p>
            <p className="mt-2 text-sm text-gray-500">
              Try another search term or create a fresh listing.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
