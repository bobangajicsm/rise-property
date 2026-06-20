import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SplitCTA() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#081215] text-white shadow-[0_30px_90px_rgba(3,12,15,0.18)]">
          <Image
            src="/18895193.jpg"
            alt="Rise Property search"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,10,12,0.86)_14%,rgba(5,10,12,0.48)_55%,rgba(5,10,12,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,176,161,0.22),transparent_28%)]" />

          <div className="relative px-6 py-12 md:px-12 md:py-16">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl leading-[0.95] font-light tracking-[-0.03em] text-white md:text-5xl xl:text-6xl">
                Search Qatar&apos;s standout listings faster.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/76 md:text-base">
                Explore curated homes, rentals, and investment properties from one clean search flow.
              </p>
              <Link
                href="/search"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-[10px] font-bold tracking-[0.24em] text-white uppercase transition-all hover:bg-white hover:text-accent"
              >
                Search Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
