import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Home,
  Layers,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";
import { AdminPropertyTypesManager } from "@/components/admin/admin-property-types-manager";
import { formatPrice } from "@/lib/property-formatting";
import {
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
  PROPERTY_VISIBILITY_DRAFT,
  PROPERTY_VISIBILITY_META,
  PROPERTY_VISIBILITY_PUBLISHED,
  type Property,
  type PropertyTypeConfig,
  type PropertyUsage,
} from "@/types/property";

interface AdminOverviewProps {
  properties: Property[];
  propertyTypes: PropertyTypeConfig[];
}

function getTopAreas(properties: Property[]) {
  const counts = new Map<string, number>();

  for (const property of properties) {
    counts.set(property.area, (counts.get(property.area) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 5);
}

function getPercentage(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function AdminOverview({
  properties,
  propertyTypes,
}: AdminOverviewProps) {
  const totalListings = properties.length;
  const publishedCount = properties.filter(
    (property) => property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED,
  ).length;
  const draftCount = properties.filter(
    (property) => property.visibilityStatus === PROPERTY_VISIBILITY_DRAFT,
  ).length;
  const buyCount = properties.filter((property) => property.listingType === "buy").length;
  const rentCount = properties.filter((property) => property.listingType === "rent").length;
  const featuredCount = properties.filter((property) =>
    property.badges.includes("FEATURED"),
  ).length;
  const activeTypeCount = propertyTypes.filter((propertyType) => propertyType.isActive).length;
  const propertyTypesByUsage = Object.fromEntries(
    PROPERTY_USAGES.map((usage) => [
      usage,
      propertyTypes.filter((propertyType) => propertyType.usage === usage),
    ]),
  ) as Record<PropertyUsage, PropertyTypeConfig[]>;
  const topAreas = getTopAreas(properties);
  const latestProperties = [...properties]
    .sort((first, second) => second.id - first.id)
    .slice(0, 5);
  const stats = [
    {
      label: "Total Listings",
      value: String(totalListings),
      icon: Building2,
      helper: "All inventory in admin",
      tone: "bg-black text-white",
    },
    {
      label: "Published",
      value: String(publishedCount),
      icon: Eye,
      helper: `${getPercentage(publishedCount, totalListings)}% visible`,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Drafts",
      value: String(draftCount),
      icon: FileText,
      helper: "Saved but hidden",
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "For Sale",
      value: String(buyCount),
      icon: Home,
      helper: "Buy catalog",
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "For Rent",
      value: String(rentCount),
      icon: BedDouble,
      helper: "Rental catalog",
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Featured",
      value: String(featuredCount),
      icon: Star,
      helper: "Homepage highlights",
      tone: "bg-accent/10 text-accent",
    },
  ];
  const visibilityRows = [
    {
      label: PROPERTY_VISIBILITY_META[PROPERTY_VISIBILITY_PUBLISHED].label,
      value: publishedCount,
      percentage: getPercentage(publishedCount, totalListings),
      className: "bg-emerald-500",
    },
    {
      label: PROPERTY_VISIBILITY_META[PROPERTY_VISIBILITY_DRAFT].label,
      value: draftCount,
      percentage: getPercentage(draftCount, totalListings),
      className: "bg-amber-400",
    },
    {
      label: "Featured",
      value: featuredCount,
      percentage: getPercentage(featuredCount, totalListings),
      className: "bg-accent",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase">
              Dashboard
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-black md:text-3xl">
              Catalog overview
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              Quick view of inventory health, publishing status, and the next
              best admin actions.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/listings/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Publish New Listing
            </Link>
            <Link
              href="/admin/listings"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-black uppercase transition-colors hover:bg-gray-50"
            >
              Manage Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-[1.25rem] border border-black/6 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold text-black">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 truncate text-xs font-medium text-gray-500">
                {stat.helper}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
            <div className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Publishing Health
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-black">
                    Visibility status
                  </h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Activity className="h-4 w-4" />
                </span>
              </div>

              <div className="space-y-4">
                {visibilityRows.map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-black">
                        {row.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {row.value} / {totalListings}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${row.className}`}
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Setup
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-black">
                    Property types
                  </h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Tags className="h-4 w-4" />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-[1rem] bg-gray-50 p-3">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                    Groups
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-black">
                    {PROPERTY_USAGES.length}
                  </p>
                </div>
                <div className="rounded-[1rem] bg-gray-50 p-3">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                    Active
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-black">
                    {activeTypeCount}
                  </p>
                </div>
                <div className="rounded-[1rem] bg-gray-50 p-3">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                    Lead
                  </p>
                  <p className="mt-2 truncate font-display text-2xl font-bold text-black">
                    {topAreas[0]?.[0] ?? "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {PROPERTY_USAGES.map((usage) => (
                  <div
                    key={usage}
                    className="flex items-center justify-between rounded-[1rem] border border-gray-100 px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-gray-700">
                      {PROPERTY_USAGE_META[usage].label}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                      {propertyTypesByUsage[usage].length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <AdminPropertyTypesManager propertyTypes={propertyTypes} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                  Quick Actions
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-black">
                  Next steps
                </h3>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>

            <div className="grid gap-2">
              {[
                {
                  href: "/admin/listings/new",
                  label: "Create / Publish Listing",
                  text: "Add images, map pin, agents and status.",
                  icon: Plus,
                },
                {
                  href: "/admin/listings",
                  label: "Review Listings",
                  text: "Update prices, status and assignments.",
                  icon: Layers,
                },
                {
                  href: "/admin/agents",
                  label: "Manage Agents",
                  text: "Control listing access and ownership.",
                  icon: CheckCircle2,
                },
              ].map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-[1rem] border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-black">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {action.text}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                  Top Areas
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-black">
                  Inventory focus
                </h3>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MapPin className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-2">
              {topAreas.length ? (
                topAreas.map(([area, count], index) => (
                  <div
                    key={area}
                    className="flex items-center justify-between gap-3 rounded-[1rem] border border-gray-100 px-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-semibold text-black">
                        {area}
                      </span>
                    </div>
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-[1rem] bg-gray-50 p-4 text-sm text-gray-500">
                  No area data yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-[1.6rem] border border-black/6 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Recent Listings
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-black">
              Latest catalog entries
            </h3>
          </div>
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.24em] text-accent uppercase"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-2">
          {latestProperties.length ? (
            latestProperties.map((property) => (
              <div
                key={property.id}
                className="grid gap-3 rounded-[1.1rem] border border-gray-100 p-3 md:grid-cols-[72px_minmax(0,1fr)_auto]"
              >
                <img
                  src={property.images[0] ?? "/images/properties/lusail-marina-penthouse-1.svg"}
                  alt={property.title}
                  className="h-20 w-full rounded-[0.9rem] object-cover md:w-[72px]"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 truncate text-sm font-bold text-black">
                      {property.title}
                    </p>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-gray-500 uppercase">
                      {PROPERTY_VISIBILITY_META[property.visibilityStatus].label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      {property.area}
                    </span>
                    <span>{property.listingType}</span>
                    <span>{property.type}</span>
                  </div>
                  <p className="mt-2 truncate text-xs text-gray-500">
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                  <p className="text-sm font-bold text-black">
                    QAR {formatPrice(property.price)}
                  </p>
                  <Link
                    href={`/admin/listings/${property.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] text-accent uppercase"
                  >
                    Edit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.1rem] border border-dashed border-gray-200 p-6 text-center">
              <p className="font-semibold text-black">No listings yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Create the first listing to start building the catalog.
              </p>
              <Link
                href="/admin/listings/new"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase"
              >
                <Plus className="h-4 w-4" />
                Publish New Listing
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
