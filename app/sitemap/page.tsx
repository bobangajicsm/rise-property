import Link from "next/link";
import { buildSitemapEntries } from "@/lib/sitemap";

export const metadata = {
  title: "Sitemap",
  description: "Browse the main pages, search collections, and property pages available on Rise Property.",
};

const CATEGORY_LABELS = {
  core: "Core Pages",
  seo: "Search Collections",
  curated: "Curated Search Links",
  property: "Property Pages",
} as const;

export default async function SitemapPage() {
  const entries = await buildSitemapEntries();
  const groupedEntries = {
    core: entries.filter((entry) => entry.category === "core"),
    seo: entries.filter((entry) => entry.category === "seo"),
    curated: entries.filter((entry) => entry.category === "curated"),
    property: entries.filter((entry) => entry.category === "property").slice(0, 24),
  };

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-6 py-24 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-black/6 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-10">
          <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
            Sitemap
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[-0.03em] md:text-6xl">
            Browse every important route in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
            This page gives a clean overview of the main pages, curated search links,
            and a sample of live property detail pages.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold text-gray-600">
            <Link
              href="/sitemap.xml"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 transition-colors hover:border-accent hover:text-accent"
            >
              Open XML Sitemap
            </Link>
            <span className="rounded-full border border-gray-200 bg-white px-4 py-2">
              {entries.length} Indexed URLs
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {(Object.keys(groupedEntries) as Array<keyof typeof groupedEntries>).map((category) => (
            <section
              key={category}
              className="rounded-[1.6rem] border border-black/6 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-black">
                  {CATEGORY_LABELS[category]}
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                  {groupedEntries[category].length}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {groupedEntries[category].map((entry) => (
                  <Link
                    key={entry.url}
                    href={entry.path}
                    className="block rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 transition-all hover:border-accent/30 hover:bg-white"
                  >
                    <p className="text-sm font-medium text-black">{entry.path}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.url}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
