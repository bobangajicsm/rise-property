'use client';

import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { resolvePropertyAgent } from "@/data/agents";
import { absoluteUrl } from "@/lib/site";
import { formatPropertyReference } from "@/lib/property-formatting";
import type { Property } from "@/types/property";

interface BookingModalProps {
  isOpen: boolean;
  mode: "request-details" | "book-viewing";
  property: Property | null;
  onClose: () => void;
}

function splitName(fullName: string) {
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);

  return {
    firstName: firstName || trimmed,
    lastName: rest.join(" ") || "Website Lead",
  };
}

export function BookingModal({
  isOpen,
  mode,
  property,
  onClose,
}: BookingModalProps) {
  const bookingsUrl = process.env.NEXT_PUBLIC_ZOHO_BOOKINGS_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });

  const propertyUrl = useMemo(() => {
    if (!property) {
      return "";
    }

    return absoluteUrl(`/properties/${property.slug}`);
  }, [property]);
  const propertyAgent = useMemo(
    () => (property ? resolvePropertyAgent(property.agent) : null),
    [property],
  );

  if (!isOpen || !property) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!property) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    const { firstName, lastName } = splitName(formData.name);

    try {
      const response = await fetch("/api/zoho/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          phone: formData.phone,
          message:
            formData.message ||
            (mode === "book-viewing"
              ? "I would like to schedule a viewing."
              : "I would like more information about this property."),
          propertyId: property.id,
          propertyReference: formatPropertyReference(property.id),
          propertyTitle: property.title,
          propertyUrl,
          propertyType: property.type,
          listingType: property.listingType,
          usage: property.usage,
          area: property.area,
          location: property.location,
          price: property.price,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          inquiryType:
            mode === "book-viewing" ? "Property Viewing" : "Request Details",
          preferredDate: formData.date,
          preferredTime: formData.time,
          source:
            mode === "book-viewing"
              ? "Website Booking"
              : "Website Request Details",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          agentName: propertyAgent?.name,
          agentEmail: propertyAgent?.email,
          agentPhone: propertyAgent?.phone,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send your request.");
      }

      setIsSubmitted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while sending your request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const title =
    mode === "book-viewing" ? "Book a Viewing" : "Request Details";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 20 }}
          className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-gray-100 p-8">
            <div>
              <h2 className="mb-2 font-display text-2xl font-bold tracking-wider text-black uppercase">
                {title}
              </h2>
              <p className="text-sm text-gray-500">{property.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {bookingsUrl && mode === "book-viewing" ? (
            <div className="space-y-6 p-8">
              <p className="text-sm leading-relaxed text-gray-500">
                Zoho Bookings is ready. You can embed your booking page here or
                open it directly in a new tab.
              </p>
              <a
                href={bookingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-[10px] font-bold tracking-widest text-white uppercase transition-all hover:bg-accent"
              >
                Open Zoho Booking
                <ExternalLink className="h-4 w-4" />
              </a>
              <iframe
                src={bookingsUrl}
                title="Zoho Bookings"
                className="h-[560px] w-full rounded-2xl border border-gray-100"
              />
            </div>
          ) : isSubmitted ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h3 className="mb-4 font-display text-2xl font-bold text-black">
                Request Received
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-gray-500">
                Thank you for your interest. One of our advisors will contact
                you shortly regarding <strong>{property.title}</strong>.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-black py-4 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-accent"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-8">
              {mode === "book-viewing" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                  <select
                    value={formData.time}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="">Preferred Time</option>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  </select>
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
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
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
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
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
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
              <textarea
                rows={4}
                placeholder="Any special requests?"
                value={formData.message}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                className="w-full resize-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
              />
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-black py-4 text-[10px] font-bold tracking-[0.2em] text-white uppercase transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : title}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
