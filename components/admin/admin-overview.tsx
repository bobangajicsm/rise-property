import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  Home,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { AdminPropertyTypesManager } from "@/components/admin/admin-property-types-manager";
import { formatPrice } from "@/lib/property-formatting";
import {
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
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

export function AdminOverview({
  properties,
  propertyTypes,
}: AdminOverviewProps) {
  const buyCount = properties.filter((property) => property.listingType === "buy").length;
  const rentCount = properties.filter((property) => property.listingType === "rent").length;
  const featuredCount = properties.filter((property) =>
    property.badges.includes("FEATURED"),
  ).length;
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
      label: "Live Listings",
      value: String(properties.length),
      icon: Building2,
      accent: "from-[#111827] to-[#1f2937]",
    },
    {
      label: "For Sale",
      value: String(buyCount),
      icon: Home,
      accent: "from-[#0f766e] to-[#115e59]",
    },
    {
      label: "For Rent",
      value: String(rentCount),
      icon: BedDouble,
      accent: "from-[#164e63] to-[#0f172a]",
    },
    {
      label: "Featured",
      value: String(featuredCount),
      icon: Star,
      accent: "from-[#1a3c40] to-[#4fb0a1]",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.25rem] bg-[radial-gradient(circle_at_top_left,_rgba(79,176,161,0.24),_transparent_34%),linear-gradient(135deg,#0f172a_0%,#162b35_52%,#21424a_100%)] p-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-white/65 uppercase">
              Admin Control Room
            </p>
            <h3 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight md:text-4xl">
              Keep the catalog clean, searchable, and ready for new types.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              The dashboard now centers property type management so listing
              creation, editing, and search filters all pull from the same live
              setup.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/listings/new"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-black uppercase transition-colors hover:bg-accent hover:text-white"
              >
                <Sparkles className="h-4 w-4" />
                Publish New Listing
              </Link>
              <Link
                href="/admin/listings"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:border-white/40 hover:bg-white/10"
              >
                Manage Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.65rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-bold tracking-[0.22em] text-white/65 uppercase">
                Type Groups
              </p>
              <p className="mt-3 font-display text-4xl font-bold">
                {PROPERTY_USAGES.length}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Primary inventory split stays fixed to the shared usage groups.
              </p>
            </div>
            <div className="rounded-[1.65rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-bold tracking-[0.22em] text-white/65 uppercase">
                Lead Area
              </p>
              <p className="mt-3 font-display text-4xl font-bold">
                {topAreas[0]?.[0] ?? "N/A"}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Strongest inventory concentration across live listings.
              </p>
            </div>
            {PROPERTY_USAGES.map((usage) => (
              <div
                key={usage}
                className="rounded-[1.65rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
              >
                <p className="text-[10px] font-bold tracking-[0.22em] text-white/65 uppercase">
                  {PROPERTY_USAGE_META[usage].label}
                </p>
                <p className="mt-3 font-display text-4xl font-bold">
                  {propertyTypesByUsage[usage].length}
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Live {PROPERTY_USAGE_META[usage].label.toLowerCase()} subcategories currently available under this main type.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="overflow-hidden rounded-[1.8rem] border border-black/5 bg-white shadow-sm"
            >
              <div className={`bg-gradient-to-br ${stat.accent} p-5 text-white`}>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/65 uppercase">
                    Live
                  </span>
                </div>
                <p className="mt-8 text-[10px] font-bold tracking-[0.24em] text-white/65 uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-4xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <AdminPropertyTypesManager propertyTypes={propertyTypes} />

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Top Areas
            </p>
            <div className="mt-5 space-y-3">
              {topAreas.map(([area, count], index) => (
                <div
                  key={area}
                  className="flex items-center justify-between rounded-[1.35rem] border border-gray-100 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-xs font-bold text-accent">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-black">{area}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Active inventory
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-black">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Workflow
            </p>
            <div className="mt-5 space-y-4">
              {[
                "Create or edit the type list first so the editor stays structured.",
                "Publish listings with the right usage and type from the same source.",
                "Review public search filters to confirm the new types are live.",
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-[1.35rem] bg-gray-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-bold text-accent shadow-sm">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-gray-600">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Latest Listings
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-black">
              Recently updated catalog
            </h3>
          </div>
          <Link
            href="/admin/listings"
            className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-4">
          {latestProperties.map((property) => (
            <div
              key={property.id}
              className="grid gap-4 rounded-[1.6rem] border border-gray-100 p-4 md:grid-cols-[110px_minmax(0,1fr)_auto]"
            >
              <img
                src={property.images[0]}
                alt={property.title}
                className="h-28 w-full rounded-[1.3rem] object-cover md:w-[110px]"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-black">
                  {property.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {property.area}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                    {property.listingType}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                    {property.type}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {property.location}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="font-semibold text-black">
                  QAR {formatPrice(property.price)}
                </p>
                <Link
                  href={`/admin/listings/${property.id}`}
                  className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] text-accent uppercase"
                >
                  Open Editor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
