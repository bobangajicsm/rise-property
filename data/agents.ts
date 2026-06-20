import type { PropertyAgent, PropertyAgentDirectoryEntry } from "@/types/property";
import { getPropertyById } from "./properties";

export const PROPERTY_AGENTS: PropertyAgentDirectoryEntry[] = [
  {
    id: "oussama-sabbagh",
    name: "Oussama Sabbagh",
    role: "Senior Property Consultant",
    image: "/team/ousama.jpeg",
    phone: "+974 3111 6240",
    email: "maha@rise-property.com",
    whatsapp: "https://wa.me/97431116240",
  },
  {
    id: "oumaima-lounissi",
    name: "Oumaima Lounissi",
    role: "Property Consultant",
    image: "/team/Oumaima.jpg",
    phone: "+974 3111 6240",
    email: "maha@rise-property.com",
    whatsapp: "https://wa.me/97431116240",
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
    id: matchedAgent.id,
    name: matchedAgent.name,
    role: matchedAgent.role,
    image: matchedAgent.image,
    phone: matchedAgent.phone,
    email: matchedAgent.email,
    whatsapp: matchedAgent.whatsapp,
  };
}
