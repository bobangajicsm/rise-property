'use client';

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Globe, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandMark } from "@/components/home/brand-mark";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  RedditIcon,
  TikTokIcon,
  XIcon,
} from "@/components/site/social-icons";
import { buildSearchPath, socialLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { PROPERTY_USAGE_META, PROPERTY_USAGES } from "@/types/property";

function socialIconClassNames(scrolled: boolean, pathname: string) {
  return pathname === "/" && !scrolled
    ? "border-white/12 bg-white/8 text-white/80 hover:border-white/24 hover:bg-white/14 hover:text-white"
    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-black";
}

function navActionGhostClassNames(scrolled: boolean, pathname: string) {
  return pathname === "/" && !scrolled
    ? "border-white/14 bg-white/8 text-white hover:border-white/24 hover:bg-white/14"
    : "border-gray-200 bg-white/88 text-gray-700 hover:border-gray-300 hover:bg-white";
}

function navActionPrimaryClassNames(scrolled: boolean, pathname: string) {
  return pathname === "/" && !scrolled
    ? "border-accent/60 bg-accent/88 text-white shadow-[0_14px_34px_rgba(79,176,161,0.22)] hover:bg-accent"
    : "border-accent/30 bg-accent text-white shadow-[0_14px_34px_rgba(79,176,161,0.18)] hover:bg-accent/92";
}

export function Nav() {
  const pathname = usePathname();
  const scrollYRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isArabicDialogOpen, setIsArabicDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const canUseDOM = typeof document !== "undefined";

  function sectionHref(section: string) {
    return pathname === "/" ? `#${section}` : `/#${section}`;
  }

  function openArabicDialog() {
    setIsArabicDialogOpen(true);
    setIsOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const bodyTop = document.body.style.top;
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (bodyTop) {
        window.scrollTo(0, scrollYRef.current);
      }
      return;
    }

    scrollYRef.current = window.scrollY;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  const desktopTone =
    pathname === "/" && !scrolled ? "text-white/82" : "text-gray-700";

  const socialItems = [
    { href: socialLinks.instagram, label: "Instagram", icon: <InstagramIcon className="h-3 w-3" /> },
    { href: socialLinks.facebook, label: "Facebook", icon: <FacebookIcon className="h-3 w-3" /> },
    { href: socialLinks.linkedin, label: "LinkedIn", icon: <LinkedInIcon className="h-3 w-3" /> },
    { href: socialLinks.x, label: "X", icon: <XIcon className="h-3 w-3" /> },
    { href: socialLinks.reddit, label: "Reddit", icon: <RedditIcon className="h-3 w-3" /> },
    { href: socialLinks.tiktok, label: "TikTok", icon: <TikTokIcon className="h-3 w-3" /> },
  ];

  const navContent = (
    <nav
      className={cn(
        "fixed top-0 right-0 left-0 z-50 px-4 transition-all duration-300 md:px-6",
        pathname === "/" && !scrolled
          ? "bg-transparent py-5"
          : "bg-white/95 py-3 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between lg:gap-8">
        <div
          className={cn(
            "hidden min-w-0 flex-1 items-center gap-5 text-[10px] font-bold tracking-[0.18em] uppercase lg:flex xl:gap-6 xl:text-[11px]",
            desktopTone,
          )}
        >
          {PROPERTY_USAGES.map((usage) => (
            <Link
              key={usage}
              href={buildSearchPath({ usage })}
              className="whitespace-nowrap transition-colors hover:text-accent"
            >
              {PROPERTY_USAGE_META[usage].label}
            </Link>
          ))}
        </div>

        <div className="flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <Link href="/" aria-label="Rise Property home">
            <BrandMark
              tone={pathname === "/" && !scrolled ? "light" : "dark"}
              variant="header"
              className={cn(
                "origin-center transition-all duration-300",
                scrolled
                  ? "scale-95"
                  : "scale-100",
              )}
            />
          </Link>
        </div>

        <div
          className={cn(
            "hidden min-w-0 flex-1 items-center justify-end gap-2.5 text-[9px] font-bold tracking-[0.16em] uppercase lg:flex xl:gap-3 xl:text-[10px]",
            desktopTone,
          )}
        >
          <a href={sectionHref("services")} className="whitespace-nowrap transition-colors hover:text-accent">
            Services
          </a>
          <a href={sectionHref("about")} className="whitespace-nowrap transition-colors hover:text-accent">
            About Us
          </a>
          <a href={sectionHref("contact")} className="whitespace-nowrap transition-colors hover:text-accent">
            Contact
          </a>
          <Link
            href="/admin/login"
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[9px] font-bold tracking-[0.16em] uppercase transition-all xl:text-[10px]",
              navActionPrimaryClassNames(scrolled, pathname),
            )}
          >
            <span>Login</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={openArabicDialog}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-[9px] font-bold tracking-[0.16em] uppercase transition-all xl:text-[10px]",
              navActionGhostClassNames(scrolled, pathname),
            )}
          >
            <Globe className="h-3 w-3" />
            Arabic
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className={cn(
            "group relative ml-3 flex h-11 w-11 items-center justify-center lg:hidden",
            pathname === "/" && !scrolled && !isOpen ? "text-white" : "text-black",
          )}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative h-5 w-6">
            <span
              className={cn(
                "absolute top-0 left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out",
                isOpen ? "top-2.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute top-2.5 left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out",
                isOpen ? "opacity-0" : "opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-out",
                isOpen ? "top-2.5 -rotate-45" : "top-5",
              )}
            />
          </span>
        </button>
      </div>
    </nav>
  );

  if (!canUseDOM) {
    return navContent;
  }

  return (
    <>
      {navContent}
      <div className="pointer-events-none fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 lg:flex xl:right-6">
        <div
          className={cn(
            "pointer-events-auto flex flex-col items-center gap-2 rounded-[1.5rem] border px-2 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-md",
            pathname === "/" && !scrolled
              ? "border-white/12 bg-black/18"
              : "border-gray-200 bg-white/92",
          )}
        >
          <span
            className={cn(
              "text-[8px] font-bold tracking-[0.28em] uppercase [writing-mode:vertical-rl] rotate-180",
              pathname === "/" && !scrolled ? "text-white/54" : "text-gray-400",
            )}
          >
            Follow
          </span>
          <div className="h-px w-4 bg-current opacity-15" />
          {socialItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                socialIconClassNames(scrolled, pathname),
              )}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[220] bg-black/96 text-white lg:hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex h-dvh flex-col px-6 pt-6 pb-10"
              >
                <div className="flex items-center justify-between">
                  <Link href="/" aria-label="Rise Property home" onClick={() => setIsOpen(false)}>
                    <BrandMark tone="light" variant="header" className="scale-90" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-accent"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-10 flex flex-1 flex-col justify-start overflow-y-auto">
                  <div className="flex flex-col border-t border-b border-white/8">
                    {[
                      { label: "Home", href: sectionHref("home") },
                      ...PROPERTY_USAGES.map((usage) => ({
                        label: PROPERTY_USAGE_META[usage].label,
                        href: buildSearchPath({ usage }),
                      })),
                      { label: "Services", href: sectionHref("services") },
                      { label: "About Us", href: sectionHref("about") },
                      { label: "Contact", href: sectionHref("contact") },
                    ].map((item, index) => (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -18 }}
                        transition={{ delay: 0.04 * index, duration: 0.24, ease: "easeOut" }}
                        className="group flex items-center justify-between border-b border-white/8 py-5 text-left text-2xl font-light tracking-[0.04em] text-white last:border-b-0"
                      >
                        <span className="transition-transform duration-300 group-hover:translate-x-2">
                          {item.label}
                        </span>
                        <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </motion.a>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ delay: 0.24, duration: 0.24, ease: "easeOut" }}
                    className="mt-8 grid w-full max-w-md grid-cols-2 gap-3"
                  >
                    <Link
                      href="/admin/login"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent px-5 py-3 text-[11px] font-bold tracking-[0.22em] text-white uppercase shadow-[0_16px_34px_rgba(79,176,161,0.24)] transition-all hover:bg-accent/92"
                    >
                      <span>Login</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={openArabicDialog}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-5 py-3 text-[11px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:border-accent/40 hover:bg-white/8"
                    >
                      <Globe className="h-4 w-4 text-accent" />
                      Arabic
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ delay: 0.28, duration: 0.24, ease: "easeOut" }}
                    className="mt-8 flex flex-wrap gap-3"
                  >
                    {socialItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        onClick={() => setIsOpen(false)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition-colors hover:border-accent/40 hover:bg-white/12"
                      >
                        {item.icon}
                      </a>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
          {isArabicDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[230] flex items-center justify-center bg-black/55 px-4"
              onClick={() => setIsArabicDialogOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full max-w-md rounded-[1.75rem] border border-white/12 bg-white p-6 text-black shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                      Coming Soon
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-950">
                      Arabic version is on the way.
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                      We&apos;re preparing the Arabic experience and it will be available soon.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsArabicDialogOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900"
                    aria-label="Close Arabic coming soon dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsArabicDialogOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-[11px] font-bold tracking-[0.2em] text-white uppercase transition-colors hover:bg-accent/90"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
