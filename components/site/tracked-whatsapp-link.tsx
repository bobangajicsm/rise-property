'use client';

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface TrackedWhatsAppLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  source?: string;
  propertyId?: number | string;
  propertyReference?: string;
  propertyTitle?: string;
  propertyUrl?: string;
  propertyType?: string;
  listingType?: string;
  usage?: string;
  area?: string;
  location?: string;
  price?: number | string;
  beds?: number | string;
  baths?: number | string;
  sqft?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  message?: string;
  target?: "_blank" | "_self";
  rel?: string;
}

function splitName(fullName: string) {
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);

  return {
    firstName: firstName || trimmed,
    lastName: rest.join(" ") || "Website Lead",
  };
}

export function TrackedWhatsAppLink({
  href,
  className,
  children,
  ariaLabel,
  source = "Website WhatsApp",
  propertyId,
  propertyReference,
  propertyTitle,
  propertyUrl,
  propertyType,
  listingType,
  usage,
  area,
  location,
  price,
  beds,
  baths,
  sqft,
  agentName,
  agentEmail,
  agentPhone,
  message = "Visitor requested a WhatsApp conversation from the website.",
  target = "_blank",
  rel = "noopener noreferrer",
}: TrackedWhatsAppLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: propertyTitle
      ? `Hi, I'm interested in ${propertyTitle}.`
      : "Hi, I would like more information.",
  });

  const resolvedPropertyUrl = useMemo(() => {
    if (propertyUrl) {
      return propertyUrl;
    }

    if (typeof window === "undefined") {
      return undefined;
    }

    return window.location.href;
  }, [propertyUrl]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function openDialog(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setError("");
    setIsOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const { firstName, lastName } = splitName(formData.name);
    const nextWindow =
      typeof window !== "undefined" && target === "_blank"
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    try {
      const leadMessage = [formData.message.trim(), message].filter(Boolean).join("\n\n");

      const response = await fetch("/api/zoho/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: leadMessage,
          propertyId,
          propertyReference,
          propertyTitle,
          propertyUrl: resolvedPropertyUrl,
          propertyType,
          listingType,
          usage,
          area,
          location,
          price,
          beds,
          baths,
          sqft,
          inquiryType: "WhatsApp Inquiry",
          source,
          channel: "WhatsApp",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          agentName,
          agentEmail,
          agentPhone,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to start the WhatsApp inquiry.");
      }

      setIsOpen(false);

      if (nextWindow) {
        nextWindow.location.href = href;
        return;
      }

      window.location.assign(href);
    } catch (submissionError) {
      nextWindow?.close();
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while sending your WhatsApp inquiry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <a
        href={href}
        onClick={openDialog}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm md:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-lg rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 md:px-7">
                <div>
                  <div className="flex items-center gap-2 text-[#25D366]">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase">
                      WhatsApp Inquiry
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-black">
                    Share your details first
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    We&apos;ll send your information to our team and then open WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                  aria-label="Close WhatsApp inquiry"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5 md:px-7 md:py-6">
                {propertyTitle ? (
                  <div className="rounded-2xl bg-gray-50 px-4 py-3">
                    <p className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                      Property
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black">
                      {propertyTitle}
                    </p>
                  </div>
                ) : null}

                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-black outline-none transition-colors focus:border-accent focus:bg-white"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-black outline-none transition-colors focus:border-accent focus:bg-white"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-black outline-none transition-colors focus:border-accent focus:bg-white"
                  />
                </div>

                <textarea
                  required
                  placeholder="Message"
                  rows={4}
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-black outline-none transition-colors focus:border-accent focus:bg-white"
                />

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-[11px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Continue to WhatsApp"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
