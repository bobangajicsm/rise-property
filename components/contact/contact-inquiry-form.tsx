'use client';

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface ContactInquiryFormProps {
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
  source?: string;
  inquiryType?: string;
  submitLabel?: string;
}

function splitName(fullName: string) {
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);

  return {
    firstName: firstName || trimmed,
    lastName: rest.join(" ") || "Website Lead",
  };
}

export function ContactInquiryForm({
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
  source = "Website Contact",
  inquiryType = "General Inquiry",
  submitLabel = "Submit Inquiry",
}: ContactInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          message: formData.message,
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
          inquiryType,
          source,
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
        throw new Error(result.error || "Unable to send your inquiry.");
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while sending your inquiry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center md:p-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h3 className="mb-4 font-display text-2xl font-bold text-black">
            Message Sent
          </h3>
          <p className="mb-8 text-sm text-gray-700">
            Thank you for reaching out. One of our property specialists will get
            back to you shortly.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="rounded-xl bg-black px-8 py-3 text-[10px] font-bold tracking-widest text-white uppercase transition-all hover:bg-accent"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
          className="w-full rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm transition-all focus:border-accent focus:outline-none"
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
          className="w-full rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm transition-all focus:border-accent focus:outline-none"
        />
      </div>
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
        className="w-full rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm transition-all focus:border-accent focus:outline-none"
      />
      <textarea
        required
        rows={4}
        placeholder="How can we help you?"
        value={formData.message}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            message: event.target.value,
          }))
        }
        className="w-full resize-none rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm transition-all focus:border-accent focus:outline-none"
      />
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-[10px] font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-black/5 transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : submitLabel}
        {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
      </button>
    </form>
  );
}
