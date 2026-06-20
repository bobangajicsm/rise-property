'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Share2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandMark } from "@/components/home/brand-mark";
import { Footer } from "@/components/home/footer";
import { resolvePropertyAgent } from "@/data/agents";
import { TrackedWhatsAppLink } from "@/components/site/tracked-whatsapp-link";
import { MapLoading } from "@/components/maps/map-loading";
import { BookingModal } from "@/components/site/booking-modal";
import {
  absoluteUrl,
  buildWhatsAppInquiry,
  siteEmail,
} from "@/lib/site";
import {
  extractSqftValue,
  formatPrice,
  formatPropertyReference,
} from "@/lib/property-formatting";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

const PropertyPreviewMap = dynamic(
  () =>
    import("@/components/maps/property-preview-map").then(
      (mod) => mod.PropertyPreviewMap,
    ),
  {
    ssr: false,
    loading: () => <MapLoading />,
  },
);

interface PropertyDetailPageProps {
  property: Property;
  relatedProperties: Property[];
}

export function PropertyDetailPage({
  property,
  relatedProperties,
}: PropertyDetailPageProps) {
  const searchParams = useSearchParams();
  const propertyAgent = resolvePropertyAgent(property.agent);
  const [bookingMode, setBookingMode] = useState<
    "request-details" | "book-viewing"
  >("request-details");
  const [currentImage, setCurrentImage] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const shareUrl = absoluteUrl(`/properties/${property.slug}`);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % property.images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [property.images.length]);

  const shareTitle = `Check out this ${property.type} in ${property.location}`;
  const backHref = useMemo(() => {
    const from = searchParams.get("from");

    if (!from || !from.startsWith("/")) {
      return `/${property.listingType}`;
    }

    return from;
  }, [property.listingType, searchParams]);

  const shareOptions = useMemo(
    () => [
      {
        name: "WhatsApp",
        icon: <MessageCircle className="h-4 w-4" />,
        color: "bg-[#25D366]",
        href: buildWhatsAppInquiry(`${shareTitle} ${shareUrl}`),
      },
      {
        name: "Email",
        icon: <Mail className="h-4 w-4" />,
        color: "bg-gray-600",
        href: `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
      },
      {
        name: "Twitter",
        icon: <Share2 className="h-4 w-4" />,
        color: "bg-[#1DA1F2]",
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: "Facebook",
        icon: <Share2 className="h-4 w-4" />,
        color: "bg-[#1877F2]",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: "LinkedIn",
        icon: <Share2 className="h-4 w-4" />,
        color: "bg-[#0077B5]",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
    ],
    [property.title, shareTitle, shareUrl],
  );

  function handleCopy() {
    if (!shareUrl || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function nextImage() {
    setCurrentImage((previous) => (previous + 1) % property.images.length);
  }

  function previousImage() {
    setCurrentImage(
      (previous) => (previous - 1 + property.images.length) % property.images.length,
    );
  }

  function openBooking(mode: "request-details" | "book-viewing") {
    setBookingMode(mode);
    setIsBookingOpen(true);
  }

  function handleGalleryTouchStart(event: React.TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleGalleryTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const touch = event.changedTouches[0];

    touchStartX.current = null;
    touchStartY.current = null;

    if (startX === null || startY === null) {
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      nextImage();
      return;
    }

    previousImage();
  }

  const statCards = [
    {
      label: "Bedrooms",
      value: String(property.beds),
      icon: <Bed className="h-5 w-5" />,
    },
    {
      label: "Bathrooms",
      value: String(property.baths),
      icon: <Bath className="h-5 w-5" />,
    },
    {
      label: "Sq Ft",
      value: extractSqftValue(property.sqft),
      icon: <Maximize className="h-5 w-5" />,
    },
    ...(property.yearBuilt
      ? [
          {
            label: "Year Built",
            value: String(property.yearBuilt),
            icon: <Calendar className="h-5 w-5" />,
          },
        ]
      : []),
    ...(property.parking !== undefined
      ? [
          {
            label: "Parking",
            value: String(property.parking),
            icon: <Car className="h-5 w-5" />,
          },
        ]
      : []),
    ...(property.furnished !== undefined
      ? [
          {
            label: "Furnished",
            value: property.furnished ? "Yes" : "No",
            icon: <CheckCircle2 className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="min-h-screen bg-white">
        <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link
              href={backHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-black hover:text-black md:bg-transparent md:shadow-none"
              aria-label="Back to search"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="justify-self-center" aria-label="Rise Property home">
              <BrandMark className="h-10 w-[132px]" />
            </Link>
            <div className="relative flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowShareMenu((value) => !value)}
                className={cn(
                  "relative rounded-full p-2 transition-colors hover:bg-gray-100",
                  showShareMenu && "bg-gray-100",
                )}
              >
                <Share2
                  className={cn(
                    "h-5 w-5 transition-colors",
                    showShareMenu ? "text-accent" : "text-gray-500",
                  )}
                />
              </button>

              <AnimatePresence>
                {showShareMenu ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-black/5"
                      onClick={() => setShowShareMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                    >
                      <div className="mb-4">
                        <h4 className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Share Property
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {shareOptions.map((option) => (
                            <a
                              key={option.name}
                              href={option.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-gray-50"
                            >
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110",
                                  option.color,
                                )}
                              >
                                {option.icon}
                              </div>
                              <span className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
                                {option.name}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-50 pt-4">
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="group flex w-full items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 transition-colors group-hover:text-accent">
                              {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Share2 className="h-4 w-4" />
                              )}
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">
                              {copied ? "Copied!" : "Copy Link"}
                            </span>
                          </div>
                          {!copied ? (
                            <ChevronRight className="h-3 w-3 text-gray-300" />
                          ) : null}
                        </button>
                      </div>
                    </motion.div>
                  </>
                ) : null}
              </AnimatePresence>

            </div>
          </div>
        </nav>

        <main className="pt-24 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-sm bg-accent px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase">
                  {property.type}
                </span>
                <span className="rounded-sm bg-black px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase">
                  ID {formatPropertyReference(property.id)}
                </span>
                {property.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-sm bg-gray-100 px-3 py-1 text-[9px] font-bold tracking-widest text-gray-500 uppercase"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-black uppercase md:text-5xl">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-sm font-light text-gray-400">
                <MapPin className="h-4 w-4 text-accent" />
                {property.location}
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-12 lg:col-span-2">
                <div
                  className="group relative -mx-6 aspect-[4/3] overflow-hidden bg-gray-100 shadow-2xl sm:mx-0 sm:aspect-[16/9] sm:rounded-2xl"
                  onTouchStart={handleGalleryTouchStart}
                  onTouchEnd={handleGalleryTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={property.images[currentImage]}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full w-full cursor-pointer object-cover"
                      onClick={() => setIsFullScreen(true)}
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>

                  <div className="absolute inset-0 hidden items-center justify-between p-4 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        previousImage();
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        nextImage();
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCurrentImage(index);
                        }}
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          currentImage === index ? "w-8 bg-white" : "w-2 bg-white/40",
                        )}
                      />
                    ))}
                  </div>

                  <div className="absolute right-6 bottom-6 flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md">
                    <Camera className="h-3 w-3" />
                    {currentImage + 1} / {property.images.length}
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-gray-100 bg-white p-6 shadow-sm lg:hidden">
                  <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                    Guide Price
                  </div>
                  <div className="mb-5 font-display text-3xl font-bold text-black">
                    QAR {formatPrice(property.price)}
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      {property.period}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase">
                      {property.area}
                    </span>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-accent uppercase">
                      {property.listingType === "rent" ? "Rental Listing" : "Sale Listing"}
                    </span>
                  </div>
                </div>

                {property.videoUrl ? (
                  <a
                    href={property.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
                        Video Tour
                      </p>
                      <h2 className="font-display text-xl font-bold text-black">
                        Watch Property Video
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Open the video tour added from admin and preview this property in motion.
                      </p>
                    </div>
                    {property.videoThumbnail ? (
                      <img
                        src={property.videoThumbnail}
                        alt={`${property.title} video thumbnail`}
                        className="hidden h-24 w-36 rounded-2xl object-cover md:block"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>
                ) : null}

                <div className="grid grid-cols-2 gap-8 border-y border-gray-100 py-8 md:grid-cols-3">
                  {statCards.map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="mb-2 flex items-center justify-center gap-2 text-accent">
                        {item.icon}
                        <span className="font-display text-2xl font-bold text-black">
                          {item.value}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-bold tracking-wider text-black uppercase">
                    Description
                  </h2>
                  <p className="text-lg leading-relaxed font-light text-gray-500">
                    {property.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="font-display text-2xl font-bold tracking-wider text-black uppercase">
                    Features & Amenities
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {property.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
                          <Check className="h-3 w-3 text-accent" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="sticky top-32 space-y-8">
                  <div className="hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-xl lg:block">
                    <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                      Guide Price
                    </div>
                    <div className="mb-6 font-display text-4xl font-bold text-black">
                      QAR {formatPrice(property.price)}
                      <span className="ml-2 text-sm font-normal text-gray-400">
                        {property.period}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase">
                          {property.area}
                        </span>
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-accent uppercase">
                          {property.listingType === "rent" ? "Rental Listing" : "Sale Listing"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking("request-details")}
                        className="w-full rounded-xl bg-black py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg shadow-black/10 transition-all hover:bg-accent"
                      >
                        Request Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openBooking("book-viewing")}
                        className="w-full rounded-xl border border-gray-200 bg-white py-4 text-xs font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-gray-50"
                      >
                        Book a Viewing
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <img
                        src={propertyAgent.image}
                        alt={propertyAgent.name}
                        className="h-16 w-16 rounded-full border-2 border-white object-cover object-top shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-black">{propertyAgent.name}</h3>
                        <p className="text-[10px] font-bold tracking-widest text-accent uppercase">
                          {propertyAgent.role}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <a
                        href={`tel:${propertyAgent.phone.replace(/\s+/g, "")}`}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold tracking-widest uppercase transition-all hover:bg-gray-100"
                      >
                        <Phone className="h-4 w-4 text-accent" />
                        Call Agent
                      </a>
                      <a
                        href={`mailto:${propertyAgent.email ?? siteEmail}?subject=${encodeURIComponent(`Inquiry about ${property.title}`)}`}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold tracking-widest uppercase transition-all hover:bg-gray-100"
                      >
                        <Mail className="h-4 w-4 text-accent" />
                        Email Agent
                      </a>
                      {propertyAgent.whatsapp ? (
                        <TrackedWhatsAppLink
                          href={propertyAgent.whatsapp}
                          source="Website WhatsApp Agent"
                          propertyId={property.id}
                          propertyReference={formatPropertyReference(property.id)}
                          propertyTitle={property.title}
                          propertyUrl={shareUrl}
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
                          message={`Visitor opened WhatsApp for ${property.title}.`}
                          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold tracking-widest uppercase transition-all hover:bg-gray-100"
                        >
                          <MessageCircle className="h-4 w-4 text-accent" />
                          WhatsApp Agent
                        </TrackedWhatsAppLink>
                      ) : null}
                    </div>
                    <div className="mt-5 rounded-2xl bg-white p-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-4 w-4 text-accent" />
                        <div className="space-y-3">
                          <BrandMark className="h-8 w-[108px]" />
                          <p className="text-sm leading-relaxed text-gray-500">
                            {property.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                    <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-gray-100 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                      <span className="text-[9px] font-bold tracking-widest text-gray-600 uppercase">
                        Interactive Map
                      </span>
                    </div>
                    <PropertyPreviewMap
                      property={property}
                      nearbyProperties={relatedProperties}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedProperties.length > 0 ? (
            <section className="mt-24 border-t border-gray-100 pt-24">
              <div className="mx-auto max-w-7xl px-6">
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-3 text-[10px] font-bold tracking-[0.32em] text-accent uppercase">
                      Suggested
                    </p>
                    <h2 className="font-serif text-4xl font-light tracking-wide text-black md:text-5xl">
                      Similar Properties You May Like
                    </h2>
                  </div>
                  <Link
                    href={`/${property.listingType}`}
                    className="text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase transition-colors hover:text-black"
                  >
                    View All {property.listingType === "rent" ? "Rentals" : "Sales"}
                  </Link>
                </div>

                <div className="mb-5 flex items-center justify-between md:hidden">
                  <span className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                    Swipe Similar Listings
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                    {Math.min(relatedProperties.length, 3)} Matches
                  </span>
                </div>

                <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:hidden no-scrollbar [scrollbar-width:none]">
                  {relatedProperties.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/properties/${item.slug}`}
                      className="group w-[86vw] max-w-[24rem] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold tracking-widest text-black uppercase backdrop-blur-sm">
                          {item.type}
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="mb-2 line-clamp-2 font-display text-lg font-bold text-black">
                          {item.title}
                        </p>
                        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>
                        <div className="mb-5 flex items-center justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                          <span>QAR {formatPrice(item.price)}</span>
                          <span>{item.period || "Total Price"}</span>
                        </div>
                        <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-500 uppercase">
                          <span className="flex items-center gap-1.5">
                            <Bed className="h-3.5 w-3.5 text-accent" />
                            {item.beds}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bath className="h-3.5 w-3.5 text-accent" />
                            {item.baths}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Maximize className="h-3.5 w-3.5 text-accent" />
                            {extractSqftValue(item.sqft)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
                  {relatedProperties.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/properties/${item.slug}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/60"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold tracking-widest text-black uppercase backdrop-blur-sm">
                          {item.type}
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="mb-2 font-display text-lg font-bold text-black transition-colors group-hover:text-accent">
                          {item.title}
                        </p>
                        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {item.location}
                        </div>
                        <div className="mb-5 flex items-center justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                          <span>QAR {formatPrice(item.price)}</span>
                          <span>{item.period || "Total Price"}</span>
                        </div>
                        <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-500 uppercase">
                          <span className="flex items-center gap-1.5">
                            <Bed className="h-3.5 w-3.5 text-accent" />
                            {item.beds}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Bath className="h-3.5 w-3.5 text-accent" />
                            {item.baths}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Maximize className="h-3.5 w-3.5 text-accent" />
                            {extractSqftValue(item.sqft)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-24 px-6">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-black text-white">
              <div className="grid gap-8 px-8 py-12 md:px-12 md:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div>
                  <p className="mb-4 text-[10px] font-bold tracking-[0.34em] text-accent uppercase">
                    Next Step
                  </p>
                  <h2 className="max-w-3xl font-serif text-4xl font-light tracking-wide md:text-5xl">
                    Ready to move on this property or want curated alternatives?
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
                    Our advisory team can arrange a private viewing, shortlist similar listings,
                    and guide you through the full rental or acquisition process.
                  </p>
                </div>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => openBooking("book-viewing")}
                    className="rounded-2xl bg-accent px-6 py-4 text-[10px] font-bold tracking-[0.24em] text-white uppercase transition-all hover:bg-white hover:text-accent"
                  >
                    Book a Private Viewing
                  </button>
                  <button
                    type="button"
                    onClick={() => openBooking("request-details")}
                    className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-[10px] font-bold tracking-[0.24em] text-white uppercase transition-all hover:bg-white hover:text-black"
                  >
                    Request Full Brochure
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <AnimatePresence>
          {isFullScreen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col bg-black"
            >
              <div className="flex items-center justify-between p-6 text-white">
                <span className="text-xs font-bold tracking-widest uppercase">
                  {currentImage + 1} / {property.images.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div
                className="relative flex flex-1 items-center justify-center p-4 md:p-12"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <motion.img
                  key={currentImage}
                  src={property.images[currentImage]}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />

                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-4 hidden h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:left-12 md:flex"
                >
                  <ArrowLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 hidden h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:right-12 md:flex"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>

              <div className="overflow-x-auto p-6">
                <div className="flex justify-center gap-4">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentImage(index)}
                      className={cn(
                        "aspect-video w-20 overflow-hidden rounded-lg border-2 transition-all",
                        currentImage === index
                          ? "scale-110 border-accent"
                          : "border-transparent opacity-50 hover:opacity-100",
                      )}
                    >
                      <img
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        mode={bookingMode}
        property={property}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
