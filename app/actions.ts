'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearAgentSession,
  createAgentSession,
  loginAgentWithCredentials,
} from "@/lib/agent-auth";
import {
  getAdminAccess,
  isPropertyOwnedByAgent,
} from "@/lib/admin-access";
import {
  clearAdminSession,
  changeAdminPassword,
  createAdminSession,
  isAdminAuthenticated,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import {
  assignAllMatchingPropertiesToAgent,
  assignPropertiesToAgent,
  changeAgentOwnPassword,
  deleteAgentById,
  transferPropertiesBetweenAgents,
  upsertAgent,
  updatePropertyAgentSnapshots,
} from "@/lib/agents-store";
import {
  addAgentToProperty,
  deletePropertyById,
  getAllProperties,
  upsertProperty,
} from "@/lib/properties-store";
import { saveFeaturedAreaConfigurations } from "@/lib/featured-areas-store";
import { savePropertyTypeConfigurations } from "@/lib/property-types-store";
import type {
  FeaturedAreaMutationInput,
  AgentAssignmentFilters,
  Property,
  PropertyAgent,
  PropertyAgentMutationInput,
  PropertyMutationInput,
  PropertyTypeMutationInput,
} from "@/types/property";

async function assertAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}

async function assertAnyAdminAccess() {
  const access = await getAdminAccess();

  if (!access) {
    throw new Error("Unauthorized");
  }

  return access;
}

function revalidatePropertyPaths(oldSlug?: string | null, newSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/buy");
  revalidatePath("/rent");
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/new");
  revalidatePath("/search");
  revalidatePath("/search/[slug]", "page");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/properties/${oldSlug}`);
  }

  if (newSlug) {
    revalidatePath(`/properties/${newSlug}`);
  }
}

function revalidateFeaturedAreaPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
}

function revalidatePropertyTypePaths() {
  revalidatePath("/");
  revalidatePath("/buy");
  revalidatePath("/rent");
  revalidatePath("/search");
  revalidatePath("/search/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/new");
}

function revalidateAgentPaths(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/buy");
  revalidatePath("/rent");
  revalidatePath("/search");
  revalidatePath("/search/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/agents");
  revalidatePath("/admin/agents/new");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/new");
  revalidatePath("/sitemap.xml");

  for (const slug of slugs) {
    revalidatePath(`/properties/${slug}`);
  }
}

function uniqueAgentIds(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}

function uniqueAgentSnapshots(agents: PropertyAgent[]) {
  const seen = new Set<string>();
  const output: PropertyAgent[] = [];

  for (const agent of agents) {
    const key = agent.id?.trim() || `${agent.name}-${agent.email ?? ""}`;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(agent);
  }

  return output;
}

export async function getData() {
  return getAllProperties({ includeDrafts: true });
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!(await validateAdminCredentials(email, password))) {
    redirect("/admin/login?error=invalid");
  }

  await clearAgentSession();
  await createAdminSession();
  redirect("/admin");
}

export async function loginAgent(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const agent = await loginAgentWithCredentials(username, password);

  if (!agent) {
    redirect("/admin/login?agentError=invalid");
  }

  await clearAdminSession();
  await createAgentSession(agent.id);
  redirect("/admin/listings");
}

export async function logoutAdmin() {
  await clearAdminSession();
  await clearAgentSession();
  redirect("/admin/login");
}

export async function changeOwnPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const access = await assertAnyAdminAccess();
  const currentPassword = String(input.currentPassword ?? "");
  const newPassword = String(input.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required.");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from the current password.");
  }

  if (access.role === "admin") {
    await changeAdminPassword(currentPassword, newPassword);
  } else {
    await changeAgentOwnPassword(access.agent.id, currentPassword, newPassword);
  }

  revalidatePath("/admin/profile");

  return { role: access.role };
}

export async function savePropertyAction(input: PropertyMutationInput) {
  const access = await assertAnyAdminAccess();

  const existingPropertiesWithDrafts = await getAllProperties({ includeDrafts: true });
  const previousProperty =
    typeof input.id === "number"
      ? existingPropertiesWithDrafts.find((property: Property) => property.id === input.id)
      : null;
  const scopedInput =
    access.role === "agent"
      ? {
          ...input,
          agentId: previousProperty?.agentId ?? access.agent.id,
          agent: previousProperty?.agent ?? access.agent,
          agentIds: uniqueAgentIds([
            previousProperty?.agentId,
            ...(previousProperty?.agentIds ?? []),
            access.agent.id,
          ]),
          agents: uniqueAgentSnapshots([
            ...(previousProperty ? [previousProperty.agent] : []),
            ...(previousProperty?.agents ?? []),
            access.agent,
          ]),
        }
      : input;

  if (access.role === "agent") {
    if (!previousProperty || !isPropertyOwnedByAgent(previousProperty, access.agent.id)) {
      throw new Error("Unauthorized");
    }
  }

  const property = await upsertProperty(scopedInput);
  revalidatePropertyPaths(previousProperty?.slug, property.slug);

  return property;
}

export async function deletePropertyAction(id: number) {
  await assertAdmin();

  const deletedProperty = await deletePropertyById(id);
  revalidatePropertyPaths(deletedProperty?.slug, null);

  return deletedProperty;
}

export async function addAgentToPropertyAction(
  propertyId: number,
  agentId: string,
) {
  await assertAdmin();

  const property = await addAgentToProperty(propertyId, agentId);
  revalidateAgentPaths([property.slug]);

  return property;
}

export async function saveFeaturedAreasAction(
  entries: FeaturedAreaMutationInput[],
) {
  await assertAdmin();

  const areas = await saveFeaturedAreaConfigurations(entries);
  revalidateFeaturedAreaPaths();

  return areas;
}

export async function savePropertyTypesAction(
  entries: PropertyTypeMutationInput[],
) {
  await assertAdmin();

  const propertyTypes = await savePropertyTypeConfigurations(entries);
  revalidatePropertyTypePaths();

  return propertyTypes;
}

export async function saveAgentAction(input: PropertyAgentMutationInput) {
  await assertAdmin();

  const agent = await upsertAgent(input);
  const snapshotUpdate = await updatePropertyAgentSnapshots(agent);
  revalidateAgentPaths(snapshotUpdate.slugs);

  return agent;
}

export async function deleteAgentAction(id: string) {
  await assertAdmin();

  const agent = await deleteAgentById(id);
  revalidateAgentPaths();

  return agent;
}

export async function assignPropertiesToAgentAction(
  agentId: string,
  propertyIds: number[],
) {
  await assertAdmin();

  const result = await assignPropertiesToAgent(agentId, propertyIds);
  revalidateAgentPaths(result.slugs);

  return result;
}

export async function assignFilteredPropertiesToAgentAction(
  agentId: string,
  filters: AgentAssignmentFilters,
) {
  await assertAdmin();

  const result = await assignAllMatchingPropertiesToAgent(agentId, filters);
  revalidateAgentPaths(result.slugs);

  return result;
}

export async function transferAgentPropertiesAction(
  fromAgentId: string,
  toAgentId: string,
) {
  await assertAdmin();

  const result = await transferPropertiesBetweenAgents(fromAgentId, toAgentId);
  revalidateAgentPaths(result.slugs);

  return result;
}
