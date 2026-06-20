import {
  Briefcase,
  Building2,
  CheckCircle2,
  Key,
  TrendingUp,
  Users,
} from "lucide-react";
import { SERVICES_LIST } from "@/data/properties";

const serviceIcons = [
  Key,
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle2,
];

export function FullService() {
  return (
    <section id="services" className="bg-white py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20">
          <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
            Our Services
          </span>
          <h2 className="mb-6 font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
            Full-Service Real Estate
          </h2>
          <p className="max-w-2xl text-base leading-relaxed font-medium text-gray-700 md:text-[17px]">
            From property search to portfolio management, Rise Property offers a
            comprehensive suite of luxury real estate services.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_LIST.map((service, index) => {
            const Icon = serviceIcons[index] ?? CheckCircle2;

            return (
              <div
                key={service.title}
                className="group rounded-xl border border-gray-100 bg-white p-10 transition-all duration-500 hover:shadow-xl"
              >
                <Icon className="mb-8 h-6 w-6 text-accent" />
                <h3 className="mb-4 text-[15px] font-bold tracking-[0.2em] uppercase md:text-base">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-700 md:text-[15px]">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
