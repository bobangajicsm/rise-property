import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { siteEmail, sitePhone } from "@/lib/site";

type FormStatus = "idle" | "loading" | "success" | "error";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

export function ContactSection() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/zoho/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Lead submission failed");
      }

      setStatus("success");
      setFormData(initialFormData);
    } catch (error) {
      console.error("Submit error:", error);
      setStatus("error");
    }
  }

  function updateField<Key extends keyof ContactFormData>(
    key: Key,
    value: ContactFormData[Key],
  ) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  return (
    <section id="contact" className="bg-gray-50 py-24">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
        <div>
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
            Get in Touch
          </span>
          <h2 className="mb-8 font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
            Contact Our Experts
          </h2>
          <p className="mb-12 leading-relaxed font-light text-gray-500">
            Whether you&apos;re looking to buy, rent, or invest, our team of
            dedicated professionals is here to guide you through every step of
            the process.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Call Us
                </div>
                <div className="text-lg font-bold">{sitePhone}</div>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Email Us
                </div>
                <div className="text-lg font-bold">{siteEmail}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-black/5 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  First Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  className="w-full rounded-xl border-none bg-gray-50 px-6 py-4 transition-all focus:ring-2 focus:ring-accent"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Last Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  className="w-full rounded-xl border-none bg-gray-50 px-6 py-4 transition-all focus:ring-2 focus:ring-accent"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Email Address
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-xl border-none bg-gray-50 px-6 py-4 transition-all focus:ring-2 focus:ring-accent"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Phone Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-xl border-none bg-gray-50 px-6 py-4 transition-all focus:ring-2 focus:ring-accent"
                placeholder="+974 0000 0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(event) => updateField("message", event.target.value)}
                className="w-full resize-none rounded-xl border-none bg-gray-50 px-6 py-4 transition-all focus:ring-2 focus:ring-accent"
                placeholder="How can we help you?"
              />
            </div>

            <button
              disabled={status === "loading"}
              type="submit"
              className="w-full rounded-xl bg-accent py-5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-accent/20 transition-all hover:bg-black disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" ? (
              <p className="text-center text-xs font-bold tracking-widest text-green-600 uppercase">
                Message sent successfully!
              </p>
            ) : null}
            {status === "error" ? (
              <p className="text-center text-xs font-bold tracking-widest text-red-600 uppercase">
                Failed to send message. Please try again.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
