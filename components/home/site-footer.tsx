import { BrandMark } from "@/components/home/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <BrandMark />
          <span className="mt-1 text-[8px] font-bold tracking-widest text-gray-400 uppercase">
            Luxury Real Estate Qatar
          </span>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          <a href="#" className="transition-colors hover:text-accent">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-accent">
            Terms of Service
          </a>
          <a href="#" className="transition-colors hover:text-accent">
            Cookies
          </a>
        </div>
        <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          © 2024 RISE REAL ESTATE. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
