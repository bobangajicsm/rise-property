import {
  Building2,
  CheckCircle2,
  LayoutGrid,
  MapPin,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { WHY_RISE } from "@/data/properties";

const whyRiseIcons = [
  LayoutGrid,
  TrendingUp,
  Building2,
  Users,
  MapPin,
  User,
];

export function WhyRise() {
  return (
    <section id="about" className="bg-white py-24 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center">
          <span className="mb-4 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
            The Rise Advantage
          </span>
          <h2 className="mb-6 font-serif text-4xl font-light tracking-wide text-black md:text-6xl">
            Why Rise Property
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed font-medium text-gray-700 md:text-[17px]">
            A premium real estate experience built on expertise, integrity, and
            an unwavering commitment to excellence.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {WHY_RISE.map((item, index) => {
            const Icon = whyRiseIcons[index] ?? CheckCircle2;

            return (
              <div
                key={item.title}
                className="group rounded-xl border border-gray-100 bg-white p-10 text-center transition-all duration-500 hover:shadow-xl"
              >
                <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 transition-all group-hover:bg-accent group-hover:text-white">
                  <Icon className="h-6 w-6 text-accent group-hover:text-white" />
                </div>
                <h3 className="mb-4 text-[15px] font-bold tracking-[0.2em] uppercase md:text-base">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-700 md:text-[15px]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
