import { getAuthenticatedAgent } from "@/lib/agent-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { ManagedPropertyAgent, Property } from "@/types/property";

export type AdminAccess =
  | { role: "admin"; agent: null }
  | { role: "agent"; agent: ManagedPropertyAgent };

export async function getAdminAccess(): Promise<AdminAccess | null> {
  if (await isAdminAuthenticated()) {
    return { role: "admin", agent: null };
  }

  const agent = await getAuthenticatedAgent();

  if (agent) {
    return { role: "agent", agent };
  }

  return null;
}

export function getPropertyOwnerAgentId(property: Property) {
  return property.agentId ?? property.agent.id ?? "";
}

export function isPropertyOwnedByAgent(property: Property, agentId: string) {
  return (
    getPropertyOwnerAgentId(property) === agentId ||
    (property.agentIds ?? []).includes(agentId)
  );
}
