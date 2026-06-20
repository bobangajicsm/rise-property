import Image from "next/image";
import { Bath, Bed, Maximize, X } from "lucide-react";
import { motion } from "motion/react";
import { TrackedWhatsAppLink } from "@/components/site/tracked-whatsapp-link";
import { resolvePropertyAgent } from "@/data/agents";
import { formatPropertyReference } from "@/lib/property-formatting";
import { absoluteUrl, buildWhatsAppInquiry } from "@/lib/site";
import type { Property } from "@/types/property";

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const whatsappMessage = `I'm interested in ${property.title}`;
  const propertyAgent = resolvePropertyAgent(property.agent);
  const propertyUrl = absoluteUrl(`/properties/${property.slug}`);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md md:p-12"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="flex max-h-full w-full max-w-6xl flex-col overflow-y-auto rounded-3xl bg-white lg:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[400px] lg:h-auto lg:w-3/5">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col p-8 md:p-12 lg:w-2/5">
          <button
            type="button"
            onClick={onClose}
            className="mb-4 self-end rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close property details"
          >
            <X className="h-6 w-6" />
          </button>

          <span className="mb-4 text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
            {property.area}
          </span>
          <h2 className="mb-6 font-display text-3xl font-bold">
            {property.title}
          </h2>

          <div className="mb-8 font-display text-2xl font-bold text-black">
            QAR {property.price.toLocaleString()}{" "}
            <span className="text-sm font-light text-gray-400">{property.period}</span>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-4 border-y border-gray-100 py-6">
            <div className="flex flex-col items-center gap-2">
              <Bed className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {property.beds} Beds
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Bath className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {property.baths} Baths
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Maximize className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {property.sqft} sqft
              </span>
            </div>
          </div>

          <p className="mb-8 leading-relaxed font-light text-gray-500">
            {property.description}
          </p>

          <div className="mb-12 flex flex-wrap gap-2">
            {property.features.map((feature) => (
              <span
                key={feature}
                className="rounded-lg bg-gray-50 px-4 py-2 text-[9px] font-bold tracking-widest text-gray-400 uppercase"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <TrackedWhatsAppLink
              href={buildWhatsAppInquiry(whatsappMessage)}
              source="Website WhatsApp Property Modal"
              propertyId={property.id}
              propertyReference={formatPropertyReference(property.id)}
              propertyTitle={property.title}
              propertyUrl={propertyUrl}
              propertyType={property.type}
              listingType={property.listingType}
              usage={property.usage}
              area={property.area}
              location={property.location}
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              sqft={property.sqft}
              agentName={propertyAgent.name}
              agentEmail={propertyAgent.email}
              agentPhone={propertyAgent.phone}
              message={`Visitor opened WhatsApp from the property modal for ${property.title}.`}
              className="block rounded-xl bg-accent py-5 text-center text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-black"
            >
              Inquire Now
            </TrackedWhatsAppLink>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
