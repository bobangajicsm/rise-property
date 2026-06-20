import Image from "next/image";
import { Bath, Bed, MapPin, Maximize } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-500 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {property.badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                "rounded-sm px-3 py-1 text-[9px] font-bold tracking-widest",
                badge === "FEATURED"
                  ? "bg-accent text-white"
                  : "bg-white/90 text-black",
              )}
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="text-xl font-bold tracking-wider text-white drop-shadow-lg">
            QAR {property.price.toLocaleString()}{" "}
            <span className="text-xs font-normal opacity-80">{property.period}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="mb-2 truncate text-lg font-bold transition-colors group-hover:text-accent">
          {property.title}
        </h3>
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="h-3 w-3 text-accent" />
          {property.location}
        </div>
        <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-accent" />
            {property.beds}
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-accent" />
            {property.baths}
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-accent" />
            {property.sqft}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
