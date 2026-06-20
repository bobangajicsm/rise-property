import type { Metadata } from "next";
import { absoluteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${siteName}`,
  description:
    "Terms governing the use of the Rise Property website, property inquiries, and advisory content.",
  alternates: {
    canonical: absoluteUrl("/terms-and-conditions"),
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="mb-8 font-display text-4xl font-bold text-black md:text-5xl">
          Terms and Conditions
        </h1>
        <div className="space-y-8 text-sm leading-relaxed text-gray-600">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              1. Website Use
            </h2>
            <p>
              By using this website, you agree to use it only for lawful
              property search, inquiry, and information purposes.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              2. Listing Information
            </h2>
            <p>
              Property information is provided for general guidance and may be
              updated, withdrawn, or changed without notice.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              3. Advisory & Availability
            </h2>
            <p>
              Submission of an inquiry or booking request does not guarantee
              property availability or create a binding agreement.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              4. Intellectual Property
            </h2>
            <p>
              Site content, branding, copy, and visual materials remain the
              property of Rise Property or its licensors unless otherwise
              stated.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
