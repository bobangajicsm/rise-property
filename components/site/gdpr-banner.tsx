'use client';

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import {
  gdprConsentChangeEvent,
  gdprConsentStorageKey,
  gdprVisibilityChangeEvent,
} from "@/lib/legal";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(gdprConsentChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(gdprConsentChangeEvent, callback);
  };
}

function getConsentSnapshot() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem(gdprConsentStorageKey);
}

function getServerConsentSnapshot() {
  return undefined;
}

export function GDPRBanner() {
  const consentValue = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const shouldShow = consentValue === null;

  useEffect(() => {
    if (consentValue === undefined || typeof window === "undefined") {
      return;
    }

    const bottomOffset = shouldShow ? "13rem" : "2rem";
    document.documentElement.style.setProperty(
      "--floating-bottom-offset",
      bottomOffset,
    );
    window.dispatchEvent(
      new CustomEvent(gdprVisibilityChangeEvent, {
        detail: { visible: shouldShow },
      }),
    );

    return () => {
      document.documentElement.style.setProperty(
        "--floating-bottom-offset",
        "2rem",
      );
      window.dispatchEvent(
        new CustomEvent(gdprVisibilityChangeEvent, {
          detail: { visible: false },
        }),
      );
    };
  }, [consentValue, shouldShow]);

  function handleConsent(value: "accepted" | "essential") {
    window.localStorage.setItem(gdprConsentStorageKey, value);
    window.dispatchEvent(new Event(gdprConsentChangeEvent));
  }

  if (consentValue === undefined || !shouldShow) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed right-0 bottom-0 left-0 z-[110] p-4 md:p-6"
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-black/5 bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <h4 className="mb-2 font-display text-sm font-bold tracking-[0.2em] text-black uppercase">
              Privacy, Cookies & GDPR
            </h4>
            <p className="max-w-3xl text-xs leading-relaxed text-gray-500 md:text-sm">
              We use essential cookies to keep the site secure and functional
              and, if you allow it, optional tools for analytics and lead
              handling. You can review how we process personal data, international
              transfers, retention, and contact requests at any time.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-black"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="transition-colors hover:text-black"
              >
                Terms
              </Link>
              <Link
                href="/cookie-policy"
                className="transition-colors hover:text-black"
              >
                Cookie Policy
              </Link>
              <Link
                href="/impressum"
                className="transition-colors hover:text-black"
              >
                Impressum
              </Link>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-[11px] leading-relaxed text-gray-500">
              <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                Selecting <strong className="font-semibold text-black">Essential Only</strong>{" "}
                keeps strictly necessary storage active while declining optional
                categories until you reopen preferences from the legal button.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[220px]">
            <button
              type="button"
              onClick={() => handleConsent("accepted")}
              className="rounded-xl bg-black px-6 py-3 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-accent"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={() => handleConsent("essential")}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors hover:border-black hover:text-black"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
