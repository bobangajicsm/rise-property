'use client';

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { deletePropertyAction } from "@/app/actions";
import { formatPrice } from "@/lib/property-formatting";
import { cn } from "@/lib/utils";
import {
  PROPERTY_VISIBILITY_META,
  PROPERTY_VISIBILITY_PUBLISHED,
  type Property,
} from "@/types/property";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

interface AdminListingsTableProps {
  properties: Property[];
}

type OptionalColumnKey = "status" | "category" | "area" | "agent" | "reference";

const optionalColumns: Array<{
  key: OptionalColumnKey;
  label: string;
}> = [
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "area", label: "Area" },
  { key: "agent", label: "Agent" },
  { key: "reference", label: "Ref" },
];

const defaultVisibleColumns: Record<OptionalColumnKey, boolean> = {
  status: false,
  category: false,
  area: false,
  agent: true,
  reference: false,
};

function getFirstImage(property: Property) {
  return property.images[0] || "/logo/black.svg";
}

function getAgentInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AgentAvatar({ property }: { property: Property }) {
  const agentName = property.agent.name || "Agent";
  const agentImage = property.agent.image?.trim();

  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-gray-100 text-[10px] font-bold text-gray-500 shadow-sm ring-1 ring-black/5"
      title={agentName}
      aria-label={agentName}
    >
      {agentImage ? (
        <img
          src={agentImage}
          alt={agentName}
          className="h-full w-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
      ) : (
        getAgentInitials(agentName)
      )}
    </span>
  );
}

function getStatusClass(property: Property) {
  return property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED
    ? "bg-emerald-50 text-emerald-700"
    : "bg-amber-50 text-amber-800";
}

function ListingActions({
  property,
  isPending,
  onDelete,
  compact,
}: {
  property: Property;
  isPending: boolean;
  onDelete: (property: Property) => void;
  compact?: boolean;
}) {
  const buttonClass = compact
    ? "inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all"
    : "inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all";

  return (
    <div className={cn("flex gap-2", compact ? "grid grid-cols-3" : "flex-wrap")}>
      <Link
        href={`/properties/${property.slug}`}
        target="_blank"
        className={cn(
          buttonClass,
          "border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black",
        )}
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </Link>
      <Link
        href={`/admin/listings/${property.id}`}
        className={cn(
          buttonClass,
          "border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black",
        )}
      >
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onDelete(property)}
        className={cn(
          buttonClass,
          "border-red-200 bg-white text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  );
}

export function AdminListingsTable({ properties }: AdminListingsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | Property["visibilityStatus"]
  >("all");
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
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
          property.agent.name,
          String(property.id),
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
      { label: "Sale", value: String(buyCount) },
      { label: "Rent", value: String(rentCount) },
    ];
  }, [properties]);

  const activeOptionalColumnCount = optionalColumns.filter(
    (column) => visibleColumns[column.key],
  ).length;
  const tableColumnCount = 3 + activeOptionalColumnCount;

  function toggleColumn(key: OptionalColumnKey) {
    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function handleDelete(property: Property) {
    setDeleteTarget(property);
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const property = deleteTarget;
    setFeedback("");

    startTransition(async () => {
      try {
        await deletePropertyAction(property.id);
        setDeleteTarget(null);
        setFeedback(`Deleted "${property.title}".`);
        router.refresh();
      } catch (error) {
        setDeleteTarget(null);
        setFeedback(
          error instanceof Error ? error.message : "Unable to delete listing.",
        );
      }
    });
  }

  return (
    <>
      <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              {stat.label}
            </span>
            <span className="font-display text-2xl font-bold text-black">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-black/5 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, location, slug, agent or ref"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,180px)_auto_auto]">
            <select
              value={visibilityFilter}
              onChange={(event) =>
                setVisibilityFilter(
                  event.target.value as "all" | Property["visibilityStatus"],
                )
              }
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Listings</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
            <button
              type="button"
              onClick={() => setShowColumnOptions((current) => !current)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                showColumnOptions
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black",
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Columns
            </button>
            <Link
              href="/admin/listings/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Link>
          </div>
        </div>

        {showColumnOptions ? (
          <div className="mt-4 rounded-[1.4rem] border border-gray-100 bg-gray-50 p-3">
            <div className="flex flex-wrap gap-2">
              {optionalColumns.map((column) => {
                const isVisible = visibleColumns[column.key];

                return (
                  <button
                    key={column.key}
                    type="button"
                    onClick={() => toggleColumn(column.key)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                      isVisible
                        ? "border-accent bg-accent text-white"
                        : "border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black",
                    )}
                  >
                    {column.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
            {filteredProperties.length} Results
          </span>
          {visibilityFilter !== "all" ? (
            <span className="rounded-full bg-accent/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              {PROPERTY_VISIBILITY_META[visibilityFilter].label}
            </span>
          ) : null}
        </div>

        {feedback ? (
          <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
            {feedback}
          </div>
        ) : null}

        <div className="mt-5 hidden overflow-x-auto rounded-[1.6rem] border border-gray-100 xl:block">
          <table className="min-w-full table-fixed text-left">
            <thead className="bg-gray-50/80">
              <tr className="text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                <th className="w-[44%] px-4 py-4">Listing</th>
                {visibleColumns.status ? <th className="w-[120px] px-4 py-4">Status</th> : null}
                {visibleColumns.category ? <th className="w-[150px] px-4 py-4">Category</th> : null}
                {visibleColumns.area ? <th className="w-[130px] px-4 py-4">Area</th> : null}
                {visibleColumns.agent ? <th className="w-[76px] px-4 py-4">Agent</th> : null}
                {visibleColumns.reference ? <th className="w-[100px] px-4 py-4">Ref</th> : null}
                <th className="w-[130px] px-4 py-4">Price</th>
                <th className="w-[220px] px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr
                  key={property.id}
                  className="border-t border-gray-100 bg-white align-middle transition-colors hover:bg-gray-50/70"
                >
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={getFirstImage(property)}
                        alt={property.title}
                        className="h-16 w-20 shrink-0 rounded-[1rem] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-black">
                          {property.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {property.location}
                        </p>
                        <Link
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          className="mt-1 block truncate text-xs font-semibold text-accent hover:text-black"
                        >
                          /properties/{property.slug}
                        </Link>
                      </div>
                    </div>
                  </td>
                  {visibleColumns.status ? (
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase",
                          getStatusClass(property),
                        )}
                      >
                        {PROPERTY_VISIBILITY_META[property.visibilityStatus].label}
                      </span>
                    </td>
                  ) : null}
                  {visibleColumns.category ? (
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                        {property.listingType} / {property.type}
                      </span>
                    </td>
                  ) : null}
                  {visibleColumns.area ? (
                    <td className="truncate px-4 py-4 text-sm text-gray-600">
                      {property.area}
                    </td>
                  ) : null}
                  {visibleColumns.agent ? (
                    <td className="px-4 py-4 text-center">
                      <AgentAvatar property={property} />
                    </td>
                  ) : null}
                  {visibleColumns.reference ? (
                    <td className="px-4 py-4 text-sm font-semibold text-gray-600">
                      #{property.id}
                    </td>
                  ) : null}
                  <td className="px-4 py-4 text-sm font-semibold text-black">
                    QAR {formatPrice(property.price)}
                  </td>
                  <td className="px-4 py-4">
                    <ListingActions
                      property={property}
                      isPending={isPending}
                      onDelete={handleDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProperties.length === 0 ? (
            <div className="bg-white px-6 py-12 text-center" style={{ gridColumn: `span ${tableColumnCount}` }}>
              <p className="font-semibold text-black">No listings found</p>
              <p className="mt-2 text-sm text-gray-500">
                Try another search term or create a fresh listing.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 xl:hidden">
          {filteredProperties.map((property) => (
            <article
              key={property.id}
              className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
                <img
                  src={getFirstImage(property)}
                  alt={property.title}
                  className="h-24 w-24 rounded-[1.1rem] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-semibold text-black">
                      {property.title}
                    </p>
                    {visibleColumns.agent ? (
                      <AgentAvatar property={property} />
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {property.location}
                  </p>
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    className="mt-1 block truncate text-xs font-semibold text-accent"
                  >
                    /properties/{property.slug}
                  </Link>
                  <p className="mt-3 text-sm font-bold text-black">
                    QAR {formatPrice(property.price)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {visibleColumns.status ? (
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase",
                      getStatusClass(property),
                    )}
                  >
                    {PROPERTY_VISIBILITY_META[property.visibilityStatus].label}
                  </span>
                ) : null}
                {visibleColumns.category ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                    {property.listingType} / {property.type}
                  </span>
                ) : null}
                {visibleColumns.area ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                    {property.area}
                  </span>
                ) : null}
                {visibleColumns.reference ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                    #{property.id}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                <ListingActions
                  property={property}
                  isPending={isPending}
                  onDelete={handleDelete}
                  compact
                />
              </div>
            </article>
          ))}

          {filteredProperties.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
              <p className="font-semibold text-black">No listings found</p>
              <p className="mt-2 text-sm text-gray-500">
                Try another search term or create a fresh listing.
              </p>
            </div>
          ) : null}
        </div>
      </div>
      </div>
      <AdminConfirmDialog
        open={deleteTarget !== null}
        variant="danger"
        title="Delete Listing"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}" from the admin and public listing pages. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isPending={isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
