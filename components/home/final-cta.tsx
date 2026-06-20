import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-white py-18 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-[linear-gradient(135deg,#071316_0%,#0f2022_55%,#163336_100%)] px-6 py-12 text-center text-white shadow-[0_30px_90px_rgba(3,12,15,0.16)] md:px-10 md:py-16">
          <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[10px] font-bold tracking-[0.28em] text-white/72 uppercase">
            Final Step
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[0.98] font-light tracking-[-0.03em] md:text-6xl">
            Ready to Find Your Next Property?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/76 md:text-lg md:leading-8">
            Speak with our advisory team to discover exclusive listings and
            tailored real estate solutions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 md:gap-5">
            <Link
              href="/#contact"
              className="rounded-full bg-accent px-8 py-3.5 text-[10px] font-bold tracking-[0.24em] text-white uppercase transition-all hover:bg-white hover:text-accent"
            >
              Book a Consultation
            </Link>
            <Link
              href="/buy"
              className="rounded-full border border-white/18 bg-white/8 px-8 py-3.5 text-[10px] font-bold tracking-[0.24em] text-white uppercase transition-all hover:bg-white hover:text-black"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
