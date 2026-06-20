import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { BrandMark } from "@/components/home/brand-mark";
import { LegalLauncher } from "@/components/site/legal-launcher";
import { TrackedWhatsAppLink } from "@/components/site/tracked-whatsapp-link";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  TikTokIcon,
  XIcon,
} from "@/components/site/social-icons";
import {
  legalReadinessNotice,
  buildSearchPath,
  siteAddress,
  siteCopyrightYear,
  siteEmail,
  sitePhone,
  siteTradingLicenceNumber,
  siteWebsiteLabel,
  siteWebsiteUrl,
  socialLinks,
  whatsappUrl,
} from "@/lib/site";

export function Footer() {
  const socialItems = [
    { href: socialLinks.instagram, label: "Instagram", icon: <InstagramIcon /> },
    { href: socialLinks.facebook, label: "Facebook", icon: <FacebookIcon /> },
    { href: socialLinks.linkedin, label: "LinkedIn", icon: <LinkedInIcon /> },
    { href: socialLinks.x, label: "X", icon: <XIcon /> },
    { href: socialLinks.reddit, label: "Reddit", icon: <RedditIcon /> },
    { href: socialLinks.tiktok, label: "TikTok", icon: <TikTokIcon /> },
  ];
  const discoverLinks = [
    {
      href: buildSearchPath({
        listingType: "buy",
        usage: "residential",
        query: "Lusail",
        sortBy: "price-desc",
      }),
      label: "New Developments",
    },
    {
      href: buildSearchPath({
        listingType: "buy",
        usage: "residential",
        priceRange: "high",
        sortBy: "price-desc",
      }),
      label: "Investment Opportunities",
    },
    {
      href: buildSearchPath({
        listingType: "buy",
        usage: "residential",
        query: "The Pearl",
        propertyType: "Penthouse",
      }),
      label: "Exclusive Properties",
    },
    {
      href: buildSearchPath({
        listingType: "rent",
        usage: "residential",
        query: "West Bay",
      }),
      label: "Properties for Rent",
    },
    {
      href: buildSearchPath({
        listingType: "buy",
        usage: "residential",
        query: "The Pearl",
      }),
      label: "Properties for Sale",
    },
    {
      href: "/#contact",
      label: "List your property",
    },
  ];
  const utilityLinks = [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#services", label: "Services" },
    { href: "/#contact", label: "Contact" },
    { href: "/sitemap", label: "Sitemap" },
  ];
  return (
    <footer className="bg-black pt-24 pb-12 text-white">
      <div className="mx-auto max-w-[92rem] px-6 xl:px-8">
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-[1fr_1.35fr_2fr] xl:gap-14">
          <div className="space-y-10">
            <div>
              <h4 className="mb-8 text-xs font-bold tracking-[0.3em] text-accent uppercase">
                Links
              </h4>
              <ul className="grid grid-cols-1 gap-4 text-[11px] font-medium tracking-widest text-gray-300 uppercase sm:grid-cols-2 xl:grid-cols-1">
                {utilityLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition-colors hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-accent"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold tracking-[0.3em] text-accent uppercase">
              Discover
            </h4>
            <ul className="space-y-4 text-[11px] font-medium tracking-widest text-gray-300 uppercase">
              {discoverLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="relative overflow-hidden rounded-3xl border border-white/14 bg-white/[0.08] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:p-10">
              <div className="pointer-events-none absolute -top-20 right-[-3.5rem] h-44 w-44 rounded-full bg-accent/22 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 left-[-2rem] h-36 w-36 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]" />

              <div className="relative">
                <h3 className="mb-2 font-display text-2xl font-bold tracking-tight text-white uppercase">
                  Stay Connected
                </h3>
                <p className="mb-10 text-sm font-light text-gray-200/85">
                  Get the latest property updates and exclusive offers directly.
                </p>

                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-6 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3 text-accent">
                      <Mail className="h-4 w-4" />
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                        Email
                      </h4>
                    </div>
                    <a
                      href={`mailto:${siteEmail}`}
                      className="block border-b border-white/25 py-3 text-sm text-gray-100 transition-colors hover:border-accent hover:text-white"
                    >
                      {siteEmail}
                    </a>
                    <p className="text-[11px] leading-relaxed font-medium text-gray-200 opacity-90">
                      <a
                        href={siteWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-white"
                      >
                        {siteWebsiteLabel}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-6 rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3 text-[#25D366]">
                      <MessageCircle className="h-4 w-4" />
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase">
                        WhatsApp
                      </h4>
                    </div>
                    <TrackedWhatsAppLink
                      href={whatsappUrl}
                      source="Website WhatsApp Footer"
                      message="Visitor clicked the WhatsApp contact link from the footer."
                      className="block border-b border-white/25 py-3 text-sm text-gray-100 transition-colors hover:border-[#25D366] hover:text-white"
                    >
                      {sitePhone}
                    </TrackedWhatsAppLink>
                    <p className="text-[11px] leading-relaxed font-medium text-gray-200 opacity-90">
                      {siteAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/10 pt-12 lg:flex-row lg:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <BrandMark tone="light" className="h-10 w-[116px] shrink-0" />
            <div className="space-y-2">
              <p className="max-w-sm text-[11px] leading-relaxed font-medium text-gray-200">
                Premier luxury real estate and property management in Qatar. Rise
                Property is dedicated to connecting discerning clients with
                properties across Qatar&apos;s most prestigious locations.
              </p>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
                {siteTradingLicenceNumber}
              </p>
            </div>
          </div>
          <div className="text-[11px] font-medium tracking-widest text-gray-200 uppercase">
            Copyright © {siteCopyrightYear} Rise Property. All Rights Reserved.
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[9px] tracking-widest text-gray-300 uppercase md:justify-start">
            <LegalLauncher />
            <Link href="/admin/login" className="transition-colors hover:text-white">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-6">
          <p className="max-w-4xl text-[11px] leading-relaxed font-medium text-gray-200">
            {legalReadinessNotice}
          </p>
        </div>
      </div>
    </footer>
  );
}
