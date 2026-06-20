import { MessageCircle } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/site/tracked-whatsapp-link";
import { whatsappUrl } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <TrackedWhatsAppLink
      href={whatsappUrl}
      source="Website WhatsApp Floating Button"
      message="Visitor clicked the floating WhatsApp button."
      className="fixed bottom-4 left-4 z-[104] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_32px_rgba(37,211,102,0.28)] transition-all hover:scale-105 md:bottom-6 md:left-6 md:h-14 md:w-14"
      aria-label="Open WhatsApp"
    >
      <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
    </TrackedWhatsAppLink>
  );
}
