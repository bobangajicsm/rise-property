import Link from "next/link";
import { POPULAR_LINKS } from "@/data/properties";

export function PopularRealEstate() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
            Explore
          </span>
          <h2 className="font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
            Explore the Most Popular Real Estate
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
          {POPULAR_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-8 text-[11px] font-bold tracking-[0.2em] text-black uppercase md:text-xs">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-gray-700 transition-colors hover:text-accent md:text-[15px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
