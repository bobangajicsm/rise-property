import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  absoluteUrl,
  legalLastUpdated,
  legalReadinessNotice,
  siteEmail,
  siteName,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${siteName}`,
  description:
    "Terms governing the use of the Rise Property website, listing information, and lead capture workflows.",
  alternates: {
    canonical: absoluteUrl("/terms-and-conditions"),
  },
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms and Conditions"
      description="These terms apply to your access to and use of the Rise Property website, including browsing listings, submitting inquiries, requesting viewings, and interacting with our content."
      lastUpdated={legalLastUpdated}
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Support
            </p>
            <a
              href={`mailto:${siteEmail}`}
              className="mt-2 block text-sm text-black transition-colors hover:text-accent"
            >
              {siteEmail}
            </a>
          </div>
          <div className="rounded-2xl bg-white p-4 text-xs leading-relaxed text-gray-500">
            {legalReadinessNotice}
          </div>
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          1. Website Use
        </h2>
        <p>
          You agree to use this website lawfully and in a way that does not
          interfere with its security, availability, or proper operation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          2. Listing Information
        </h2>
        <p>
          Listings, images, floor areas, pricing, availability, and related
          descriptions are provided for general guidance only and may be updated,
          withdrawn, or corrected without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          3. No Binding Offer
        </h2>
        <p>
          Website content does not constitute a legally binding offer, real
          estate reservation, valuation, or promise of availability. Any
          transaction remains subject to separate documentation and approval.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          4. Bookings and Inquiries
        </h2>
        <p>
          Submitting an inquiry, contact request, or viewing request does not
          guarantee a response time, appointment, or property allocation. We may
          request additional verification before proceeding.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          5. Third-Party Services
        </h2>
        <p>
          We may use third-party providers for maps, lead handling, bookings,
          communication, and technical infrastructure. Their services may be
          governed by separate contractual terms and privacy notices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          6. Intellectual Property
        </h2>
        <p>
          The website design, branding, copy, data compilations, and visual
          materials are protected by intellectual property laws and may not be
          reproduced or reused without permission, except where applicable law
          permits.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          7. Liability
        </h2>
        <p>
          To the maximum extent permitted by law, we exclude liability for
          indirect losses, reliance on outdated listing information, and
          temporary website interruptions. Nothing in these terms limits
          liability where such limitation is prohibited by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          8. Governing Law
        </h2>
        <p>
          These terms are governed by the law specified in your contractual
          relationship with Rise Property or, where no contract exists, the law
          determined under applicable conflict-of-law rules.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          9. Contact
        </h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href={`mailto:${siteEmail}`}
            className="text-accent transition-colors hover:text-black"
          >
            {siteEmail}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
