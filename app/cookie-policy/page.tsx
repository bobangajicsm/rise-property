import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  absoluteUrl,
  legalLastUpdated,
  legalReadinessNotice,
  siteName,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `Cookie Policy | ${siteName}`,
  description:
    "Understand how Rise Property uses essential and optional cookies and similar technologies.",
  alternates: {
    canonical: absoluteUrl("/cookie-policy"),
  },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Cookies"
      title="Cookie Policy"
      description="This page explains what cookies and similar technologies are used on this website, why they are used, and how you can manage your preferences."
      lastUpdated={legalLastUpdated}
      aside={
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-4 text-xs leading-relaxed text-gray-500">
            Essential cookies are used to keep the site functional and to store
            your consent choice. Optional categories should only be activated
            after consent.
          </div>
          <div className="rounded-2xl bg-white p-4 text-xs leading-relaxed text-gray-500">
            {legalReadinessNotice}
          </div>
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          1. What Cookies Are
        </h2>
        <p>
          Cookies are small text files or similar browser storage technologies
          that help websites remember settings, maintain sessions, and understand
          how visitors use online services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          2. Essential Technologies
        </h2>
        <p>
          Essential technologies are used for core website functions, security,
          consent state, and reliable delivery of requested content. These are
          necessary for the website to operate correctly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          3. Optional Analytics and Lead Tools
        </h2>
        <p>
          If enabled, optional tools may help us understand aggregate website
          usage, attribute campaigns, and connect inquiry forms with external
          systems such as Zoho CRM or booking workflows.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          4. Legal Basis
        </h2>
        <p>
          Essential storage is used because it is necessary for website
          functionality and documenting consent. Optional categories should be
          activated only on the basis of user consent where required by
          applicable EU rules.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          5. Managing Preferences
        </h2>
        <p>
          You can manage cookies through your browser controls and through the
          website&apos;s legal launcher, which lets you reopen cookie preferences
          and review the current legal pages at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          6. Third Parties
        </h2>
        <p>
          Embedded maps, video sources, CRM workflows, booking tools, and hosted
          infrastructure may place or access similar technologies depending on
          how they are configured in production.
        </p>
      </section>
    </LegalPageShell>
  );
}
