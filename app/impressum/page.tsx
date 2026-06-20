import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  absoluteUrl,
  consumerRedressUrl,
  legalEditorialResponsibility,
  legalEntityName,
  legalLastUpdated,
  legalProfessionalRules,
  legalReadinessNotice,
  legalRegisterNumber,
  legalRepresentative,
  legalSupervisoryAuthority,
  legalVatNumber,
  siteAddress,
  siteEmail,
  siteName,
  sitePhone,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `Impressum | ${siteName}`,
  description:
    "Legal notice and provider information for Rise Property, prepared for EU-facing operations and disclosure expectations.",
  alternates: {
    canonical: absoluteUrl("/impressum"),
  },
};

export default function ImpressumPage() {
  return (
    <LegalPageShell
      eyebrow="Legal Notice"
      title="Impressum"
      description="This page is structured as a legal notice for EU-facing operations, including the disclosure items commonly expected for German-speaking markets such as Austria and Germany."
      lastUpdated={legalLastUpdated}
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Direct Contact
            </p>
            <a
              href={`mailto:${siteEmail}`}
              className="mt-2 block text-sm text-black transition-colors hover:text-accent"
            >
              {siteEmail}
            </a>
            <a
              href={`tel:${sitePhone.replace(/\s+/g, "")}`}
              className="mt-2 block text-sm text-black transition-colors hover:text-accent"
            >
              {sitePhone}
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
          1. Service Provider
        </h2>
        <p>{legalEntityName}</p>
        <p>{siteAddress}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          2. Authorised Representative
        </h2>
        <p>{legalRepresentative}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          3. Register Information
        </h2>
        <p>{legalRegisterNumber}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          4. VAT / Tax Information
        </h2>
        <p>{legalVatNumber}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          5. Supervisory Authority
        </h2>
        <p>{legalSupervisoryAuthority}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          6. Professional Rules
        </h2>
        <p>{legalProfessionalRules}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          7. Editorial Responsibility
        </h2>
        <p>{legalEditorialResponsibility}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          8. Dispute Resolution
        </h2>
        <p>
          The former EU Online Dispute Resolution platform was discontinued on
          20 July 2025. Information about recognised consumer dispute resolution
          bodies can be found at{" "}
          <a
            href={consumerRedressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-black"
          >
            {consumerRedressUrl}
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          9. Important Go-Live Note
        </h2>
        <p>
          Before launching to EU markets, replace all placeholder details on
          this page with your official registered company name, registration
          identifiers, representative, and supervisory disclosures.
        </p>
      </section>
    </LegalPageShell>
  );
}
