'use client';

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import {
  gdprConsentChangeEvent,
  gdprConsentStorageKey,
} from "@/lib/legal";
import { cn } from "@/lib/utils";

const legalItems = [
  {
    href: "/privacy-policy",
    label: "Privacy Policy",
  },
  {
    href: "/cookie-policy",
    label: "Cookie Policy",
  },
  {
    href: "/terms-and-conditions",
    label: "Terms & Conditions",
  },
  {
    href: "/impressum",
    label: "Impressum",
  },
];

interface LegalLauncherProps {
  className?: string;
}

export function LegalLauncher({ className }: LegalLauncherProps) {
  const [open, setOpen] = useState(false);

  function reopenConsent() {
    window.localStorage.removeItem(gdprConsentStorageKey);
    window.dispatchEvent(new Event(gdprConsentChangeEvent));
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="absolute bottom-full left-0 z-[120] mb-3 w-[280px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-[1.1rem] bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-500 uppercase">
                Legal & Privacy
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Quick access to privacy, cookies, terms and EU-facing legal
                notice pages.
              </p>
            </div>

            <div className="mt-3 space-y-1">
              {legalItems.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition-colors hover:bg-gray-50"
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={reopenConsent}
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-colors hover:border-black hover:text-black"
            >
              Review Cookie Preferences
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.22em] text-gray-300 uppercase transition-colors hover:text-white"
        aria-expanded={open}
        aria-label="Open GDPR and privacy links"
      >
        Legal & Privacy
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open ? "rotate-0" : "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
