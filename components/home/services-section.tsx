import Image from "next/image";
import { Building2, Key, TrendingUp, Users } from "lucide-react";

const services = [
  { title: "Brokerage", icon: Key },
  { title: "Management", icon: Building2 },
  { title: "Investment", icon: TrendingUp },
  { title: "Advisory", icon: Users },
];

export function ServicesSection() {
  return (
    <section id="services" className="overflow-hidden bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-24 lg:grid-cols-2">
          <div>
            <span className="mb-6 block text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              Our Expertise
            </span>
            <h2 className="mb-12 font-display text-5xl leading-[0.9] font-bold tracking-tighter uppercase md:text-7xl">
              Elevating <br />
              <span className="font-light italic text-accent">Standards</span>
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-500 hover:border-accent hover:bg-accent"
                >
                  <service.icon className="mb-6 h-8 w-8 text-accent transition-colors group-hover:text-white" />
                  <h3 className="mb-2 text-lg font-bold tracking-widest uppercase">
                    {service.title}
                  </h3>
                  <p className="text-xs leading-relaxed font-light text-gray-500 group-hover:text-white/80">
                    Bespoke solutions tailored to your unique real estate
                    objectives.
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-[120px]" />
            <div className="relative z-10 h-full w-full overflow-hidden rounded-[4rem]">
              <Image
                src="https://images.unsplash.com/photo-1600607687960-e03f6c81b4d8?auto=format&fit=crop&q=80&w=1400"
                alt="Luxury interior"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover grayscale transition-all duration-1000 hover:grayscale-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
