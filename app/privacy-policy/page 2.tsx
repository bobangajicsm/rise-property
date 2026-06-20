import type { Metadata } from "next";
import { absoluteUrl, privacyEmail, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteName}`,
  description:
    "Read how Rise Property handles personal data, cookies, and client inquiries under GDPR and Qatar data protection requirements.",
  alternates: {
    canonical: absoluteUrl("/privacy-policy"),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="mb-8 font-display text-4xl font-bold text-black md:text-5xl">
          Privacy Policy
        </h1>
        <div className="space-y-8 text-sm leading-relaxed text-gray-600">
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              1. Data Collection
            </h2>
            <p>
              We collect information you provide when you submit an inquiry,
              request property details, schedule a viewing, or contact our
              advisory team.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              2. Use of Information
            </h2>
            <p>
              Your information is used to respond to your request, match you
              with suitable properties, and manage client communications.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              3. Cookies & Tracking
            </h2>
            <p>
              We use essential and analytical cookies to improve website
              performance and measure engagement.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              4. Your Rights
            </h2>
            <p>
              Under GDPR and applicable Qatar privacy law, you may request
              access, correction, or deletion of your personal data.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              5. Zoho CRM Integration
            </h2>
            <p>
              Form submissions may be securely processed through Zoho CRM and
              related services used by Rise Property to manage inquiries and
              booking requests.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-black uppercase">
              6. Contact
            </h2>
            <p>
              For privacy-related requests, contact{" "}
              <a
                href={`mailto:${privacyEmail}`}
                className="text-accent transition-colors hover:text-black"
              >
                {privacyEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
