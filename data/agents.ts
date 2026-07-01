import {
  LISTING_TYPES,
  PROPERTY_USAGES,
  type ManagedPropertyAgent,
  type PropertyAgent,
  type PropertyAgentCapabilities,
  type PropertyAgentDirectoryEntry,
} from "@/types/property";

export const DEFAULT_AGENT_CAPABILITIES: PropertyAgentCapabilities = {
  listingTypes: [...LISTING_TYPES],
  usages: [...PROPERTY_USAGES],
  leadRouting: true,
  showOnWebsite: true,
  canReceiveWhatsApp: true,
  canReceiveEmail: true,
};

export const PROPERTY_AGENTS: ManagedPropertyAgent[] = [
  {
    id: "oussama-sabbagh",
    slug: "oussama-sabbagh",
    name: "Oussama Sabbagh",
    role: "Senior Property Consultant",
    image: "/team/ousama.jpeg",
    imageKey: undefined,
    phone: "+974 3111 6240",
    email: "maha@rise-property.com",
    whatsapp: "https://wa.me/97431116240",
    bio: "",
    languages: [],
    specialties: [],
    areas: [],
    capabilities: DEFAULT_AGENT_CAPABILITIES,
    isActive: true,
    isDefault: true,
    sortOrder: 0,
    listingCount: 0,
  },
  {
    id: "oumaima-lounissi",
    slug: "oumaima-lounissi",
    name: "Oumaima Lounissi",
    role: "Property Consultant",
    image: "/team/Oumaima.jpg",
    imageKey: undefined,
    phone: "+974 3111 6240",
    email: "maha@rise-property.com",
    whatsapp: "https://wa.me/97431116240",
    bio: "",
    languages: [],
    specialties: [],
    areas: [],
    capabilities: DEFAULT_AGENT_CAPABILITIES,
    isActive: true,
    isDefault: false,
    sortOrder: 1,
    listingCount: 0,
  },
];

export const defaultPropertyAgent = PROPERTY_AGENTS[0];

function normalizeAgentValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function getPropertyAgentById(id?: string | null) {
  if (!id) {
    return defaultPropertyAgent;
  }

  return PROPERTY_AGENTS.find((agent) => agent.id === id) ?? defaultPropertyAgent;
}



export function resolvePropertyAgent(
  agent?: Partial<PropertyAgent> | null,
): PropertyAgentDirectoryEntry {
  const matchedAgent =
    PROPERTY_AGENTS.find((entry) => entry.id === normalizeAgentValue(agent?.id)) ??
    PROPERTY_AGENTS.find(
      (entry) => normalizeAgentValue(entry.email) === normalizeAgentValue(agent?.email),
    ) ??
    PROPERTY_AGENTS.find(
      (entry) => normalizeAgentValue(entry.name) === normalizeAgentValue(agent?.name),
    ) ??
    defaultPropertyAgent;

  return {
    ...matchedAgent,
    ...agent,
    id: agent?.id?.trim() || matchedAgent.id,
    slug: agent?.slug?.trim() || matchedAgent.slug,
    name: agent?.name?.trim() || matchedAgent.name,
    role: agent?.role?.trim() || matchedAgent.role,
    image: agent?.image?.trim() || matchedAgent.image,
    imageKey: agent?.imageKey ?? matchedAgent.imageKey,
    phone: agent?.phone?.trim() || matchedAgent.phone,
    email: agent?.email?.trim() || matchedAgent.email,
    whatsapp: agent?.whatsapp?.trim() || matchedAgent.whatsapp,
    bio: agent?.bio ?? matchedAgent.bio,
    languages: agent?.languages ?? matchedAgent.languages,
    specialties: agent?.specialties ?? matchedAgent.specialties,
    areas: agent?.areas ?? matchedAgent.areas,
    capabilities: {
      ...matchedAgent.capabilities,
      ...agent?.capabilities,
    },
    isActive: agent?.isActive ?? matchedAgent.isActive,
    isDefault: agent?.isDefault ?? matchedAgent.isDefault,
    sortOrder: agent?.sortOrder ?? matchedAgent.sortOrder,
    listingCount: agent?.listingCount ?? matchedAgent.listingCount,
  };
}
