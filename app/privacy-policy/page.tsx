import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  absoluteUrl,
  legalLastUpdated,
  legalReadinessNotice,
  privacyEmail,
  siteAddress,
  siteName,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteName}`,
  description:
    "Read how Rise Property handles personal data, cookies, inquiries, and transfers for GDPR-aligned operations.",
  alternates: {
    canonical: absoluteUrl("/privacy-policy"),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      description="This policy explains how personal data is collected, used, stored, disclosed, and protected when you browse our website, submit an inquiry, request property details, or book a viewing."
      lastUpdated={legalLastUpdated}
      aside={
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
              Contact
            </p>
            <a
              href={`mailto:${privacyEmail}`}
              className="mt-2 block text-sm text-black transition-colors hover:text-accent"
            >
              {privacyEmail}
            </a>
            <p className="mt-2 text-sm text-gray-500">{siteAddress}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-xs leading-relaxed text-gray-500">
            {legalReadinessNotice}
          </div>
        </div>
      }
    >
      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          1. Data Controller
        </h2>
        <p>
          Unless stated otherwise for a specific form, Rise Property acts as the
          controller for the personal data processed through this website and
          related inquiry workflows.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          2. Categories of Personal Data
        </h2>
        <p>
          We may process identification and contact details, inquiry content,
          preferred viewing dates, property interests, technical usage data,
          consent choices, and correspondence history with our advisory team.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          3. Purposes and Legal Bases
        </h2>
        <p>
          We process data to respond to inquiries, arrange viewings, provide
          requested property information, manage client relationships, protect
          website security, and comply with legal obligations. Depending on the
          interaction, the legal basis may be pre-contractual steps, legitimate
          interests, consent, or legal compliance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          4. Cookies and Similar Technologies
        </h2>
        <p>
          Essential technologies are used to maintain website functionality and
          consent preferences. Optional categories, where activated, may support
          analytics, campaign attribution, and lead handling. Further details are
          available in our Cookie Policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          5. Recipients and Processors
        </h2>
        <p>
          Personal data may be shared with carefully selected service providers
          who support hosting, lead management, booking workflows, email
          communications, security, and customer operations. This may include
          Zoho services when you submit contact or booking requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          6. International Transfers
        </h2>
        <p>
          Because our business and service providers may operate internationally,
          personal data can be accessed or stored outside the EEA. Where this
          occurs, we rely on appropriate safeguards such as contractual
          protections, provider security controls, and transfer mechanisms
          designed to support GDPR-aligned processing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          7. Retention
        </h2>
        <p>
          We keep personal data only for as long as necessary to answer your
          request, manage ongoing client discussions, document consent and legal
          compliance, and resolve disputes. Retention periods may differ by
          inquiry type and applicable legal requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          8. Your Rights
        </h2>
        <p>
          Depending on your location and applicable law, you may have rights to
          access, rectify, erase, restrict, object, or request portability of
          your personal data, as well as the right to withdraw consent where
          processing relies on consent.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          9. Complaints
        </h2>
        <p>
          If you believe your data protection rights have been infringed, you
          may contact us first so we can assist, and you may also lodge a
          complaint with the competent data protection authority in your place of
          residence or work.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest text-black uppercase">
          10. Contact
        </h2>
        <p>
          For privacy questions or rights requests, contact{" "}
          <a
            href={`mailto:${privacyEmail}`}
            className="text-accent transition-colors hover:text-black"
          >
            {privacyEmail}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
