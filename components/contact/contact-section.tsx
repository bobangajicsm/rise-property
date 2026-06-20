import { Mail, MapPin, Phone } from "lucide-react";
import { ContactInquiryForm } from "@/components/contact/contact-inquiry-form";
import {
  siteAddress,
  siteEmail,
  sitePhone,
  sitePhoneHref,
} from "@/lib/site";

export function ContactSection() {
  return (
    <section id="contact" className="bg-white px-6 py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 p-8 md:p-12">
          <div className="mb-12 max-w-2xl text-center md:text-left">
            <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
              Contact
            </span>
            <h2 className="mb-4 font-display text-3xl font-bold text-black md:text-4xl">
              Inquire Now
            </h2>
            <p className="text-gray-700">
              Connect with Qatar&apos;s leading property consultants for a
              personalized advisory experience.
            </p>
          </div>

          <div className="grid items-start gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-bold tracking-widest text-black uppercase">
                    Call Us
                  </h4>
                  <a
                    href={`tel:${sitePhoneHref}`}
                    className="text-sm text-gray-700 transition-colors hover:text-black"
                  >
                    {sitePhone}
                  </a>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-bold tracking-widest text-black uppercase">
                    Email
                  </h4>
                  <a
                    href={`mailto:${siteEmail}`}
                    className="text-sm text-gray-700 transition-colors hover:text-black"
                  >
                    {siteEmail}
                  </a>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="mb-1 text-xs font-bold tracking-widest text-black uppercase">
                    Visit
                  </h4>
                  <p className="text-sm text-gray-700">{siteAddress}</p>
                </div>
              </div>
            </div>

            <ContactInquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
