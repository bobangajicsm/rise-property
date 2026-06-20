import { defaultPropertyAgent } from "@/data/agents";
import {
  buildSeoSearchPath,
  getSeoSearchPageByLabel,
} from "@/data/seo-search-pages";
import {
  PROPERTY_VISIBILITY_PUBLISHED,
  type Area,
  type LinkGroup,
  type Property,
} from "@/types/property";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const areaImages = [
  "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1580674239581-3fbc1b42911a?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1614605242014-c64190965394?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800",
];

const propertyImageSets = [
  [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&q=80&w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200",
  ],
  [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200",
  ],
];

const featuresPool = [
  "Smart Home System",
  "Infinity Pool",
  "Private Balcony",
  "Maid's Room",
  "Valet Parking",
  "Concierge Service",
  "High-speed Elevators",
  "Private Garden",
];

const propertyTitles = {
  Apartment: [
    "Luxury 2BR Apartment",
    "Modern Studio",
    "Spacious Family Apartment",
    "Sea View Residence",
  ],
  Villa: [
    "Magnificent 5BR Villa",
    "Private Garden Villa",
    "Beachfront Mansion",
    "Contemporary Villa",
  ],
  Penthouse: [
    "Exclusive Sky Penthouse",
    "Panoramic View Penthouse",
    "Grand Duplex Penthouse",
  ],
  Office: [
    "Premium Office Space",
    "Business District Suite",
    "Corporate Headquarters",
  ],
  Shop: [
    "Prime Retail Shop",
    "Luxury Boutique Space",
    "High Street Retail Unit",
  ],
} as const;

const QATAR_AREA_PRESETS: Array<{
  name: string;
  center: [number, number];
}> = [
  { name: "The Pearl", center: [25.3694, 51.5511] },
  { name: "West Bay", center: [25.323, 51.526] },
  { name: "Lusail", center: [25.4111, 51.5032] },
  { name: "West Bay Lagoon", center: [25.3833, 51.5167] },
  { name: "Msheireb", center: [25.2867, 51.5282] },
  { name: "Al Dafna", center: [25.326, 51.53] },
  { name: "Al Sadd", center: [25.2862, 51.5078] },
  { name: "Bin Mahmoud", center: [25.2798, 51.5143] },
  { name: "Najma", center: [25.2748, 51.5483] },
  { name: "Al Mansoura", center: [25.2759, 51.5348] },
  { name: "Old Airport", center: [25.2514, 51.5536] },
  { name: "Umm Ghuwailina", center: [25.2732, 51.5531] },
  { name: "Al Hilal", center: [25.2588, 51.5407] },
  { name: "Abu Hamour", center: [25.2362, 51.48] },
  { name: "Al Waab", center: [25.2525, 51.455] },
  { name: "Al Messila", center: [25.2858, 51.4664] },
  { name: "Al Thumama", center: [25.2413, 51.5435] },
  { name: "Madinat Khalifa", center: [25.3135, 51.4798] },
  { name: "Al Gharrafa", center: [25.3289, 51.4414] },
  { name: "Education City", center: [25.3155, 51.4376] },
  { name: "Al Rayyan", center: [25.2919, 51.4244] },
  { name: "Al Wakrah", center: [25.1715, 51.6034] },
  { name: "Al Wukair", center: [25.1517, 51.537] },
  { name: "Al Khor", center: [25.6839, 51.5058] },
  { name: "Umm Salal Mohammed", center: [25.4201, 51.4065] },
  { name: "Fox Hills", center: [25.4048, 51.4762] },
  { name: "Marina District", center: [25.4145, 51.5208] },
  { name: "Porto Arabia", center: [25.3723, 51.5459] },
  { name: "Viva Bahriya", center: [25.381, 51.5539] },
  { name: "Al Qassar", center: [25.3481, 51.5337] },
  { name: "Onaiza", center: [25.3603, 51.514] },
];

export const AREAS: Area[] = QATAR_AREA_PRESETS.map((area, index) => ({
  ...area,
  image: areaImages[index % areaImages.length],
}));

const featuredAreaNames = new Set([
  "The Pearl",
  "West Bay",
  "Lusail",
  "West Bay Lagoon",
  "Msheireb",
  "Al Dafna",
  "Al Sadd",
  "Al Wakrah",
]);

export const FEATURED_AREAS = AREAS.filter((area) =>
  featuredAreaNames.has(area.name),
);

export const SEARCH_LOCATIONS = [
  ...new Set([
    ...AREAS.map((area) => area.name),
    "Doha",
    "Doha Corniche",
    "Legtaifiya",
    "Qatar",
  ]),
];

export const MOCK_PROPERTIES: Property[] = Array.from({ length: 60 }, (_, index) => {
  const area = AREAS[index % AREAS.length];
  const types = ["Apartment", "Villa", "Penthouse", "Office", "Shop"] as const;
  const type = types[index % types.length];
  const usage = type === "Office" || type === "Shop" ? "commercial" : "residential";
  const listingType = index % 2 === 0 ? "buy" : "rent";
  const beds =
    type === "Office" || type === "Shop" ? (index % 3) + 1 : ((index + 1) % 5) + 1;
  const price =
    listingType === "rent"
      ? 5000 + ((index * 1450) % 40000)
      : 1200000 + ((index * 780000) % 23800000);
  const titleOptions = propertyTitles[type];
  const title = `${titleOptions[index % titleOptions.length]} in ${area.name}`;
  const images = propertyImageSets[index % propertyImageSets.length];
  const sqftValue = 800 + ((index * 275) % 4000);
  const isPremium =
    price > 10000000 || (listingType === "rent" && price > 25000);

  return {
    id: index,
    slug: `${slugify(title)}-${index + 1}`,
    title,
    location: `${area.name}, Qatar`,
    price,
    period: listingType === "rent" ? "/month" : "",
    beds,
    baths: Math.max(1, beds + (index % 2)),
    sqft: `${sqftValue.toLocaleString()} sqft`,
    images,
    badges: isPremium ? ["FEATURED", "LUXURY"] : ["NEW"],
    type,
    listingType,
    visibilityStatus: PROPERTY_VISIBILITY_PUBLISHED,
    usage,
    area: area.name,
    lat: area.center[0] + ((index % 5) - 2) * 0.003,
    lng: area.center[1] + (((index + 2) % 5) - 2) * 0.003,
    description: `Experience the pinnacle of luxury living in this exquisite ${type.toLowerCase()} located in the heart of ${area.name}. This property boasts high-end finishes, state-of-the-art appliances, and floor-to-ceiling windows that flood the space with natural light. Residents enjoy access to world-class amenities including a temperature-controlled pool, fully-equipped fitness center, and 24/7 concierge service.`,
    features: featuresPool.slice(0, 4 + (index % 4)),
    yearBuilt: 2015 + (index % 10),
    parking:
      type === "Office" || type === "Shop" ? 3 + (index % 5) : 1 + (index % 3),
    furnished: index % 2 === 0,
    videoUrl:
      index % 3 === 0
        ? "https://www.w3schools.com/html/mov_bbb.mp4"
        : undefined,
    videoThumbnail:
      index % 3 === 0 ? images[2] : undefined,
    agent: {
      ...defaultPropertyAgent,
    },
  };
});

export const RECOMMENDED_PROPERTIES = MOCK_PROPERTIES.slice(0, 4);

export function getPropertyById(id: number) {
  return MOCK_PROPERTIES.find((property) => property.id === id);
}

export function getPropertyBySlug(slug: string) {
  return MOCK_PROPERTIES.find((property) => property.slug === slug);
}

export function getPropertiesByListingType(type: Property["listingType"]) {
  return MOCK_PROPERTIES.filter((property) => property.listingType === type);
}

export function getPropertiesByArea(areaName: string) {
  return MOCK_PROPERTIES.filter((property) => property.area === areaName);
}

export function getRelatedProperties(property: Property, limit = 8) {
  return MOCK_PROPERTIES.filter(
    (entry) => entry.id !== property.id && entry.area === property.area,
  ).slice(0, limit);
}

export const WHY_RISE = [
  {
    title: "CURATED LISTINGS",
    description:
      "Every property is personally vetted to ensure it meets our exacting standards of quality and value.",
  },
  {
    title: "EXPERT ADVISORY",
    description:
      "Market intelligence and strategic guidance for informed real estate decisions in Qatar.",
  },
  {
    title: "PROPERTY MANAGEMENT",
    description:
      "Comprehensive management services that protect and enhance your investment.",
  },
  {
    title: "INVESTOR SUPPORT",
    description:
      "Tailored investment strategies and portfolio advisory for local and international investors.",
  },
  {
    title: "LOCAL EXPERTISE",
    description:
      "Deep knowledge of Qatar's premium neighborhoods, market dynamics, and regulatory landscape.",
  },
  {
    title: "DEDICATED SERVICE",
    description:
      "A personal advisor for every client, ensuring a seamless and elevated experience.",
  },
] as const;

export const SERVICES_LIST = [
  {
    title: "Brokerage",
    description:
      "Expert-led property transactions with market insight and negotiation excellence.",
  },
  {
    title: "Property Management",
    description:
      "End-to-end management services for landlords and investors seeking peace of mind.",
  },
  {
    title: "Commercial Leasing",
    description:
      "Premium commercial spaces and office solutions for businesses in Qatar.",
  },
  {
    title: "Tenant Services",
    description:
      "Dedicated support for tenants throughout their lease journey.",
  },
  {
    title: "Investment Advisory",
    description:
      "Strategic investment backed by deep market knowledge.",
  },
  {
    title: "Maintenance",
    description:
      "Proactive property maintenance to protect and enhance asset value.",
  },
] as const;

export const POPULAR_LINKS: LinkGroup[] = [
  {
    title: "POPULAR SEARCHES",
    links: [
      {
        label: "Properties for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Properties for sale in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for sale in Qatar")!.slug,
        ),
      },
      {
        label: "Apartments for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Apartments for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Villas for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Villas for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Studios for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Studios for rent in Qatar")!.slug,
        ),
      },
    ],
  },
  {
    title: "POPULAR AREAS",
    links: [
      {
        label: "Properties for rent in The Pearl",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in The Pearl")!.slug,
        ),
      },
      {
        label: "Properties for rent in West Bay",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in West Bay")!.slug,
        ),
      },
      {
        label: "Properties for rent in Lusail",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in Lusail")!.slug,
        ),
      },
      {
        label: "Properties for sale in The Pearl",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for sale in The Pearl")!.slug,
        ),
      },
      {
        label: "Properties for sale in Lusail",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for sale in Lusail")!.slug,
        ),
      },
    ],
  },
  {
    title: "TRENDING AREAS",
    links: [
      {
        label: "Apartments for sale in Lusail",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Apartments for sale in Lusail")!.slug,
        ),
      },
      {
        label: "Properties for rent in Al Dafna",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in Al Dafna")!.slug,
        ),
      },
      {
        label: "Villas for sale in West Bay Lagoon",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Villas for sale in West Bay Lagoon")!.slug,
        ),
      },
      {
        label: "Properties for rent in Msheireb",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Properties for rent in Msheireb")!.slug,
        ),
      },
      {
        label: "Offices for rent in West Bay",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Offices for rent in West Bay")!.slug,
        ),
      },
    ],
  },
  {
    title: "TRENDING SEARCHES",
    links: [
      {
        label: "Offices for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Offices for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Villas for sale in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Villas for sale in Qatar")!.slug,
        ),
      },
      {
        label: "Townhouses for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Townhouses for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Commercial for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Commercial for rent in Qatar")!.slug,
        ),
      },
      {
        label: "Penthouses for rent in Qatar",
        href: buildSeoSearchPath(
          getSeoSearchPageByLabel("Penthouses for rent in Qatar")!.slug,
        ),
      },
    ],
  },
];
