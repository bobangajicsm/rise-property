'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  Map as MapIcon,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Share2,
  X,
} from "lucide-react";
import { Footer } from "@/components/home/footer";
import { MapLoading } from "@/components/maps/map-loading";
import { BookingModal } from "@/components/site/booking-modal";
import { TrackedWhatsAppLink } from "@/components/site/tracked-whatsapp-link";
import { resolvePropertyAgent } from "@/data/agents";
import {
  extractSqftValue,
  formatPrice,
  formatPropertyReference,
} from "@/lib/property-formatting";
import {
  absoluteUrl,
  buildWhatsAppInquiry,
} from "@/lib/site";
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
  const images =
    property.images.length > 0
      ? property.images
      : ["/images/properties/lusail-marina-penthouse-1.svg"];
  const [bookingMode, setBookingMode] = useState<
    "request-details" | "book-viewing"
  >("request-details");
  const [currentImage, setCurrentImage] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showTopNav, setShowTopNav] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const specsSectionRef = useRef<HTMLElement | null>(null);
  const specsCardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const shareUrl = absoluteUrl(`/properties/${property.slug}`);

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
        href: buildWhatsAppInquiry(`${shareTitle} ${shareUrl}`),
      },
      {
        name: "Email",
        icon: <Mail className="h-4 w-4" />,
        href: `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
      },
      {
        name: "Twitter",
        icon: <Share2 className="h-4 w-4" />,
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: "Facebook",
        icon: <Share2 className="h-4 w-4" />,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      {
        name: "LinkedIn",
        icon: <Share2 className="h-4 w-4" />,
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      },
    ],
    [property.title, shareTitle, shareUrl],
  );

  function nextImage() {
    setCurrentImage((previous) => (previous + 1) % images.length);
  }

  function previousImage() {
    setCurrentImage((previous) => (previous - 1 + images.length) % images.length);
  }

  function openBooking(mode: "request-details" | "book-viewing") {
    setBookingMode(mode);
    setIsBookingOpen(true);
  }

  function handleCopy() {
    if (!shareUrl || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      nextImage();
      return;
    }

    previousImage();
  }

  useEffect(() => {
    if (images.length < 2 || isFullScreen) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % images.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [images.length, isFullScreen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopNav(window.scrollY > 90);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const section = specsSectionRef.current;

    if (!section) {
      return;
    }

    let cleanup: (() => void) | undefined;
    let isCancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (isCancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const cards = specsCardsRef.current.filter(
        (card): card is HTMLDivElement => Boolean(card),
      );

      const context = gsap.context(() => {
        gsap.fromTo(
          cards,
          {
            y: 46,
            opacity: 0.58,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              end: "bottom 58%",
              scrub: 0.8,
            },
          },
        );
      }, section);

      cleanup = () => context.revert();
    })();

    return () => {
      isCancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullScreen(false);
        return;
      }

      if (event.key === "ArrowRight") {
        setCurrentImage((previous) => (previous + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setCurrentImage((previous) => (previous - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, images.length]);

  const statCards = [
    {
      label: "Bedrooms",
      value: String(property.beds),
      icon: <Bed className="h-4 w-4" />,
    },
    {
      label: "Bathrooms",
      value: String(property.baths),
      icon: <Bath className="h-4 w-4" />,
    },
    {
      label: "Sq Ft",
      value: extractSqftValue(property.sqft),
      icon: <Maximize className="h-4 w-4" />,
    },
    ...(property.yearBuilt
      ? [
          {
            label: "Year Built",
            value: String(property.yearBuilt),
            icon: <Calendar className="h-4 w-4" />,
          },
        ]
      : []),
    ...(property.parking !== undefined
      ? [
          {
            label: "Parking",
            value: String(property.parking),
            icon: <Car className="h-4 w-4" />,
          },
        ]
      : []),
    ...(property.furnished !== undefined
      ? [
          {
            label: "Furnished",
            value: property.furnished ? "Yes" : "No",
            icon: <CheckCircle2 className="h-4 w-4" />,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="min-h-screen bg-white text-black">
        <Link
          href={backHref}
          className={cn(
            "fixed top-4 left-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/90 text-black shadow-[0_14px_40px_rgba(15,23,42,0.22)] backdrop-blur-md transition-all duration-300 hover:bg-white",
            showTopNav && "pointer-events-none -translate-y-2 opacity-0",
          )}
          aria-label="Back to search"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <nav
          className={cn(
            "fixed top-0 right-0 left-0 z-[60] bg-white/95 px-3 py-2 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 md:px-5",
            showTopNav
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-full opacity-0",
          )}
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={backHref}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition-colors hover:border-black hover:bg-white hover:text-black"
                aria-label="Back to search"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-black md:max-w-[20rem]">
                  {property.title}
                </p>
                <p className="hidden truncate text-[10px] font-semibold tracking-[0.08em] text-gray-400 uppercase sm:block md:max-w-[20rem]">
                  {property.location}
                </p>
              </div>
            </div>

            <div className="hidden items-center rounded-full border border-gray-200 bg-gray-50 p-1 text-[9px] font-bold tracking-[0.16em] text-gray-500 uppercase lg:flex">
              <a href="#overview" className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black">
                Overview
              </a>
              <a href="#features" className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black">
                Features
              </a>
              <a href="#photos" className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black">
                Photos
              </a>
              {property.videoUrl ? (
                <a href="#video" className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black">
                  Video
                </a>
              ) : null}
              <a href="#map" className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black">
                Map
              </a>
            </div>

            <div className="relative flex shrink-0 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openBooking("request-details")}
                className="hidden h-10 items-center rounded-full bg-black px-5 text-[9px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-accent sm:inline-flex"
              >
                Request Info
              </button>
              <button
                type="button"
                onClick={() => setShowShareMenu((value) => !value)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:border-black hover:bg-white hover:text-black",
                  showShareMenu && "border-black text-black",
                )}
                aria-label="Share property"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {showShareMenu ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default bg-transparent"
                    aria-label="Close share menu"
                    onClick={() => setShowShareMenu(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <div className="grid gap-1.5">
                      {shareOptions.map((option) => (
                        <a
                          key={option.name}
                          href={option.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-[0.18em] text-gray-600 uppercase transition-colors hover:bg-gray-50 hover:text-black"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                            {option.icon}
                          </span>
                          {option.name}
                        </a>
                      ))}
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-[0.18em] text-gray-600 uppercase transition-colors hover:bg-gray-50 hover:text-black"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                        </span>
                        {copied ? "Copied" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </nav>

        <main className="pb-16">
          <section id="photos" className="mx-auto max-w-[1500px] px-0 sm:px-4 md:px-6">
            <div
              className="relative h-[100svh] min-h-[540px] max-h-[860px] overflow-hidden bg-gray-100 sm:rounded-b-[1.25rem]"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <div
                className="flex h-full transition-transform duration-200 ease-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setIsFullScreen(true)}
                    className="relative h-full w-full shrink-0 cursor-zoom-in"
                    aria-label={`Open image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </button>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/22 to-transparent" />

              <div className="absolute top-20 left-4 flex flex-wrap gap-2 md:top-6 md:left-20">
                <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-black uppercase shadow-sm">
                  {property.type}
                </span>
                <span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white uppercase shadow-sm">
                  ID {formatPropertyReference(property.id)}
                </span>
                <span className="rounded-full bg-accent px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] text-white uppercase shadow-sm">
                  {property.listingType === "rent" ? "For Rent" : "For Sale"}
                </span>
              </div>

              <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6">
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[9px] font-bold tracking-[0.18em] text-black uppercase shadow-lg transition-colors hover:bg-black hover:text-white"
                >
                  <Camera className="h-3.5 w-3.5" />
                  View Photos
                </button>
                <span className="hidden h-10 items-center rounded-full bg-black/75 px-4 text-[10px] font-bold tracking-[0.18em] text-white uppercase shadow-lg sm:flex">
                  {currentImage + 1} / {images.length}
                </span>
              </div>

              <div className="absolute bottom-[20rem] left-4 max-w-[min(88vw,760px)] text-white md:bottom-10 md:left-8 md:max-w-[min(56vw,760px)]">
                <h1 className="font-display text-3xl font-bold leading-tight tracking-normal md:text-5xl lg:text-6xl">
                  {property.title}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-white/85 md:text-base">
                  <MapPin className="h-4 w-4 shrink-0 text-accent" />
                  <span className="line-clamp-1">{property.location}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statCards.slice(0, 3).map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-black uppercase shadow-sm"
                    >
                      {item.icon}
                      {item.value} {item.label === "Sq Ft" ? "sqft" : item.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute right-4 bottom-4 w-[min(92vw,380px)] overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/95 text-left shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-md md:right-8 md:bottom-8">
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                  <p className="text-[9px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Guide Price
                  </p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                    {property.listingType === "rent" ? "Rental" : "Sale"}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="font-display text-3xl font-bold leading-none text-black md:text-[2rem]">
                    QAR {formatPrice(property.price)}
                  </div>
                  {property.period ? (
                    <p className="mt-2 text-xs font-semibold tracking-[0.1em] text-gray-400 uppercase">
                      {property.period}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <img
                      src={propertyAgent.image}
                      alt={propertyAgent.name}
                      className="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover object-top shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-black">
                        {propertyAgent.name}
                      </p>
                      <p className="truncate text-[9px] font-bold tracking-[0.16em] text-accent uppercase">
                        {propertyAgent.role}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <a
                        href={`tel:${propertyAgent.phone.replace(/\s+/g, "")}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-black hover:text-black"
                        aria-label="Call agent"
                      >
                        <Phone className="h-3.5 w-3.5" />
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
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-black hover:text-black"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </TrackedWhatsAppLink>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openBooking("request-details")}
                      className="h-10 rounded-xl bg-black px-3 text-[9px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-accent"
                    >
                      Request Info
                    </button>
                    <button
                      type="button"
                      onClick={() => openBooking("book-viewing")}
                      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-[9px] font-bold tracking-[0.16em] text-black uppercase transition-colors hover:bg-gray-50"
                    >
                      Book Viewing
                    </button>
                  </div>
                </div>
              </div>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-black hover:text-white md:left-6"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-black hover:text-white md:right-6"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 sm:px-0">
                {images.map((image, index) => (
                  <button
                    key={`thumb-${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    className={cn(
                      "h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100 transition-colors md:h-20 md:w-32",
                      currentImage === index
                        ? "border-accent"
                        : "border-transparent hover:border-gray-300",
                    )}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section
            ref={specsSectionRef}
            className="mx-auto mt-5 max-w-[1500px] px-4 md:px-6"
          >
            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] md:p-5">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.26em] text-accent uppercase">
                    Residence Specs
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-black">
                    Key details at a glance
                  </h2>
                </div>
                <span className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase">
                  Scroll to reveal
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {statCards.slice(0, 6).map((item, index) => (
                  <div
                    key={item.label}
                    ref={(node) => {
                      specsCardsRef.current[index] = node;
                    }}
                    className="group min-h-[132px] rounded-[1.15rem] border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-gray-200 hover:bg-white"
                  >
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-accent shadow-sm transition-colors group-hover:bg-accent group-hover:text-white">
                      {item.icon}
                    </div>
                    <div className="font-display text-3xl font-bold leading-none text-black">
                      {item.value}
                    </div>
                    <p className="mt-2 text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="overview" className="mx-auto mt-10 grid max-w-[1500px] gap-8 px-4 md:px-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.72fr)] lg:items-start">
            <div className="space-y-8">
              <div className="border-y border-gray-100 py-8">
                <p className="mb-3 text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                  Property Overview
                </p>
                <h2 className="font-display text-2xl font-bold tracking-normal text-black md:text-3xl">
                  Clear details without the clutter
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600">
                  {property.description}
                </p>
              </div>

              {property.videoUrl ? (
                <a
                  id="video"
                  href={property.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-colors hover:border-accent/40 hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                      Video Tour
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-black">
                      Watch Property Video
                    </h2>
                  </div>
                  {property.videoThumbnail ? (
                    <img
                      src={property.videoThumbnail}
                      alt={`${property.title} video thumbnail`}
                      className="hidden h-20 w-32 rounded-xl object-cover md:block"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <ExternalLink className="h-5 w-5 shrink-0 text-gray-400" />
                </a>
              ) : null}

              <div id="features">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                      Included
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-black">
                      Features & Amenities
                    </h2>
                  </div>
                  <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase sm:inline-flex">
                    {property.features.length} Items
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium leading-relaxed text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="map" className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                  <MapIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                    Location
                  </p>
                  <h2 className="font-display text-2xl font-bold text-black">
                    Map & Nearby Listings
                  </h2>
                </div>
              </div>
              <div className="relative h-[340px] overflow-hidden rounded-[1.25rem] border border-gray-100 bg-gray-100 shadow-sm md:h-[430px] lg:h-[520px]">
                <div className="absolute top-4 left-4 z-[1000] max-w-[calc(100%-2rem)] rounded-lg border border-gray-100 bg-white/95 px-3 py-2 shadow-sm">
                  <p className="line-clamp-1 text-[9px] font-bold tracking-[0.18em] text-gray-600 uppercase">
                    {property.location}
                  </p>
                </div>
                <PropertyPreviewMap
                  property={property}
                  nearbyProperties={relatedProperties}
                />
              </div>
            </div>
          </section>

          {relatedProperties.length > 0 ? (
            <section className="mx-auto mt-16 max-w-[1500px] px-4 md:px-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
                    Suggested
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-black md:text-3xl">
                    Similar Properties
                  </h2>
                </div>
                <Link
                  href={`/${property.listingType}`}
                  className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase transition-colors hover:text-black"
                >
                  View All {property.listingType === "rent" ? "Rentals" : "Sales"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
                {relatedProperties.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/properties/${item.slug}`}
                    className="group w-[86vw] max-w-[25rem] shrink-0 snap-start overflow-hidden rounded-[1.25rem] border border-gray-100 bg-white transition-colors hover:border-gray-200 md:w-auto md:max-w-none"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-[9px] font-bold tracking-[0.18em] text-black uppercase shadow-sm">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="line-clamp-2 font-display text-lg font-bold leading-snug text-black group-hover:text-accent">
                        {item.title}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                        <span className="line-clamp-1">{item.location}</span>
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <span className="text-xs font-bold text-black">
                          QAR {formatPrice(item.price)}
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.16em] text-gray-400 uppercase">
                          {item.period || "Total Price"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mx-auto mt-16 max-w-[1500px] px-4 md:px-6">
            <div className="grid gap-6 rounded-[1.5rem] bg-black px-6 py-8 text-white md:px-8 md:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
                  Next Step
                </p>
                <h2 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight md:text-4xl">
                  Ready to move on this property?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                  Request full details or book a private viewing with the assigned advisor.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
                <button
                  type="button"
                  onClick={() => openBooking("request-details")}
                  className="rounded-xl bg-white px-5 py-4 text-xs font-bold tracking-[0.22em] text-black uppercase transition-colors hover:bg-accent hover:text-white"
                >
                  Request Details
                </button>
                <button
                  type="button"
                  onClick={() => openBooking("book-viewing")}
                  className="rounded-xl border border-white/20 bg-white/5 px-5 py-4 text-xs font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-white hover:text-black"
                >
                  Book Viewing
                </button>
              </div>
            </div>
          </section>
        </main>

        {isFullScreen ? (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            <div className="flex items-center justify-between px-4 py-4 text-white md:px-6">
              <span className="text-xs font-bold tracking-[0.22em] uppercase">
                {currentImage + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className="relative flex flex-1 items-center overflow-hidden"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <div
                className="flex h-full w-full transition-transform duration-200 ease-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div
                    key={`full-${image}-${index}`}
                    className="flex h-full w-full shrink-0 items-center justify-center px-4 py-3 md:px-12"
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>

              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black md:left-8"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black md:right-8"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 py-4 md:justify-center">
                {images.map((image, index) => (
                  <button
                    key={`full-thumb-${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    className={cn(
                      "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      currentImage === index
                        ? "border-accent"
                        : "border-white/20 hover:border-white",
                    )}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
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
