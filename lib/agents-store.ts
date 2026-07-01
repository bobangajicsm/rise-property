import {
  DEFAULT_AGENT_CAPABILITIES,
  PROPERTY_AGENTS,
  defaultPropertyAgent,
  resolvePropertyAgent,
} from "@/data/agents";
import { getSql } from "@/lib/neon";
import { slugifyPropertyValue } from "@/lib/property-slug";
import {
  LISTING_TYPES,
  PROPERTY_USAGES,
  PROPERTY_VISIBILITY_PUBLISHED,
  PROPERTY_VISIBILITY_STATUSES,
  type AgentAssignmentFilters,
  type ListingType,
  type ManagedPropertyAgent,
  type Property,
  type PropertyAgent,
  type PropertyAgentCapabilities,
  type PropertyAgentMutationInput,
  type PropertyUsage,
  type PropertyVisibilityStatus,
} from "@/types/property";

interface AgentRow {
  id: string;
  slug: string | null;
  name: string | null;
  role: string | null;
  image_url: string | null;
  image_key: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  bio: string | null;
  languages: unknown;
  specialties: unknown;
  areas: unknown;
  capabilities: unknown;
  is_active: boolean | string | null;
  is_default: boolean | string | null;
  sort_order: number | string | null;
}

interface PropertyAssignmentRow {
  id: number | string;
  slug: string;
  title: string;
  location: string;
  listing_type: ListingType | string;
  visibility_status: PropertyVisibilityStatus | string | null;
  usage: PropertyUsage | string | null;
  type: string;
  area: string;
  agent_id: string | null;
  agent: unknown;
}

interface AssignmentResult {
  count: number;
  slugs: string[];
}

let agentsSchemaReadyPromise: Promise<void> | null = null;

function asRows<T>(value: unknown) {
  return value as T[];
}

function normalizeText(value: string | null | undefined, fallback = "") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeSortOrder(value: number | string | null | undefined, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBoolean(value: boolean | string | null | undefined, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return fallback;
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeCapabilityArray<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): T[] {
  const entries = parseJsonArray(value);
  const allowed = new Set<string>(allowedValues);
  const normalized = entries.filter((entry): entry is T => allowed.has(entry));
  return normalized.length > 0 ? normalized : [...allowedValues];
}

function normalizeCapabilities(value: unknown): PropertyAgentCapabilities {
  const input =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<PropertyAgentCapabilities>)
      : {};

  return {
    listingTypes: normalizeCapabilityArray(input.listingTypes, LISTING_TYPES),
    usages: normalizeCapabilityArray(input.usages, PROPERTY_USAGES),
    leadRouting:
      typeof input.leadRouting === "boolean"
        ? input.leadRouting
        : DEFAULT_AGENT_CAPABILITIES.leadRouting,
    showOnWebsite:
      typeof input.showOnWebsite === "boolean"
        ? input.showOnWebsite
        : DEFAULT_AGENT_CAPABILITIES.showOnWebsite,
    canReceiveWhatsApp:
      typeof input.canReceiveWhatsApp === "boolean"
        ? input.canReceiveWhatsApp
        : DEFAULT_AGENT_CAPABILITIES.canReceiveWhatsApp,
    canReceiveEmail:
      typeof input.canReceiveEmail === "boolean"
        ? input.canReceiveEmail
        : DEFAULT_AGENT_CAPABILITIES.canReceiveEmail,
  };
}

function parseCapabilities(value: unknown) {
  if (typeof value === "string") {
    try {
      return normalizeCapabilities(JSON.parse(value));
    } catch {
      return DEFAULT_AGENT_CAPABILITIES;
    }
  }

  return normalizeCapabilities(value);
}

function parseAgentIdFromSnapshot(value: unknown) {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parseAgentIdFromSnapshot(parsed);
    } catch {
      return undefined;
    }
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" && id.trim() ? id.trim() : undefined;
  }

  return undefined;
}

function mapAgentRowToAgent(
  row: AgentRow,
  listingCount: number,
): ManagedPropertyAgent {
  const name = normalizeText(row.name, defaultPropertyAgent.name);
  const id = normalizeText(row.id, slugifyPropertyValue(name));
  const slug = normalizeText(row.slug, slugifyPropertyValue(name) || id);

  return {
    id,
    slug,
    name,
    role: normalizeText(row.role, defaultPropertyAgent.role),
    image: normalizeText(row.image_url, defaultPropertyAgent.image),
    imageKey: normalizeText(row.image_key) || undefined,
    phone: normalizeText(row.phone, defaultPropertyAgent.phone),
    email: normalizeText(row.email, defaultPropertyAgent.email),
    whatsapp: normalizeText(row.whatsapp, defaultPropertyAgent.whatsapp),
    bio: normalizeText(row.bio),
    languages: parseJsonArray(row.languages),
    specialties: parseJsonArray(row.specialties),
    areas: parseJsonArray(row.areas),
    capabilities: parseCapabilities(row.capabilities),
    isActive: normalizeBoolean(row.is_active, true),
    isDefault: normalizeBoolean(row.is_default, false),
    sortOrder: normalizeSortOrder(row.sort_order),
    listingCount,
  };
}

function mapSeedAgent(agent: ManagedPropertyAgent): ManagedPropertyAgent {
  return {
    ...agent,
    capabilities: normalizeCapabilities(agent.capabilities),
    listingCount: 0,
  };
}

function toAgentSnapshot(agent: ManagedPropertyAgent): PropertyAgent {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    role: agent.role,
    image: agent.image,
    imageKey: agent.imageKey,
    phone: agent.phone,
    email: agent.email,
    whatsapp: agent.whatsapp,
    bio: agent.bio,
    languages: agent.languages,
    specialties: agent.specialties,
    areas: agent.areas,
    capabilities: agent.capabilities,
    isActive: agent.isActive,
    isDefault: agent.isDefault,
    sortOrder: agent.sortOrder,
  };
}

function sortAgents(agents: ManagedPropertyAgent[]) {
  return [...agents].sort((first, second) => {
    if (first.isDefault !== second.isDefault) {
      return first.isDefault ? -1 : 1;
    }

    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });
}

async function ensurePropertyAgentColumn() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await sql`
    ALTER TABLE IF EXISTS properties
    ADD COLUMN IF NOT EXISTS agent_id TEXT
  `;
}

async function propertyTableExists() {
  const sql = getSql();

  if (!sql) {
    return false;
  }

  const [{ exists }] = asRows<{ exists: boolean }>(await sql`
    SELECT to_regclass('public.properties') IS NOT NULL AS exists
  `);

  return exists;
}

async function backfillPropertyAgentIds(defaultAgentId: string) {
  const sql = getSql();

  if (!sql || !(await propertyTableExists())) {
    return;
  }

  await ensurePropertyAgentColumn();

  await sql`
    UPDATE properties
    SET agent_id = COALESCE(
      (
        SELECT agents.id
        FROM agents
        WHERE agents.id = properties.agent->>'id'
        LIMIT 1
      ),
      (
        SELECT agents.id
        FROM agents
        WHERE LOWER(agents.name) = LOWER(properties.agent->>'name')
        LIMIT 1
      ),
      ${defaultAgentId}
    )
    WHERE agent_id IS NULL OR agent_id = ''
  `;
}

async function ensureAgentsSchema() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!agentsSchemaReadyPromise) {
    agentsSchemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS agents (
          id TEXT PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          image_url TEXT NOT NULL,
          image_key TEXT,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          whatsapp TEXT NOT NULL,
          bio TEXT,
          languages JSONB NOT NULL DEFAULT '[]'::jsonb,
          specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
          areas JSONB NOT NULL DEFAULT '[]'::jsonb,
          capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS slug TEXT`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS image_key TEXT`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS bio TEXT`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS areas JSONB DEFAULT '[]'::jsonb`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}'::jsonb`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`;
      await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`;

      const [{ count }] = asRows<{ count: string }>(await sql`
        SELECT COUNT(*)::text AS count FROM agents
      `);

      if (Number(count) === 0) {
        for (const agent of PROPERTY_AGENTS) {
          await sql`
            INSERT INTO agents (
              id,
              slug,
              name,
              role,
              image_url,
              image_key,
              phone,
              email,
              whatsapp,
              bio,
              languages,
              specialties,
              areas,
              capabilities,
              is_active,
              is_default,
              sort_order,
              updated_at
            ) VALUES (
              ${agent.id},
              ${agent.slug},
              ${agent.name},
              ${agent.role},
              ${agent.image},
              ${agent.imageKey ?? null},
              ${agent.phone},
              ${agent.email},
              ${agent.whatsapp},
              ${agent.bio},
              ${JSON.stringify(agent.languages)}::jsonb,
              ${JSON.stringify(agent.specialties)}::jsonb,
              ${JSON.stringify(agent.areas)}::jsonb,
              ${JSON.stringify(agent.capabilities)}::jsonb,
              ${agent.isActive},
              ${agent.isDefault},
              ${agent.sortOrder},
              NOW()
            )
          `;
        }
      }

      await sql`
        UPDATE agents
        SET
          slug = COALESCE(NULLIF(slug, ''), id),
          languages = COALESCE(languages, '[]'::jsonb),
          specialties = COALESCE(specialties, '[]'::jsonb),
          areas = COALESCE(areas, '[]'::jsonb),
          capabilities = COALESCE(capabilities, '{}'::jsonb),
          is_active = COALESCE(is_active, TRUE),
          is_default = COALESCE(is_default, FALSE),
          sort_order = COALESCE(sort_order, 0),
          updated_at = COALESCE(updated_at, NOW())
      `;

      const [{ default_count }] = asRows<{ default_count: string }>(await sql`
        SELECT COUNT(*)::text AS default_count
        FROM agents
        WHERE is_default = TRUE AND is_active = TRUE
      `);

      if (Number(default_count) === 0) {
        await sql`
          UPDATE agents
          SET is_default = TRUE, updated_at = NOW()
          WHERE id = (
            SELECT id
            FROM agents
            WHERE is_active = TRUE
            ORDER BY sort_order ASC, name ASC
            LIMIT 1
          )
        `;
      }

      await ensurePropertyAgentColumn();

      const [defaultRow] = asRows<{ id: string }>(await sql`
        SELECT id
        FROM agents
        WHERE is_default = TRUE AND is_active = TRUE
        ORDER BY sort_order ASC, name ASC
        LIMIT 1
      `);

      if (defaultRow?.id) {
        await backfillPropertyAgentIds(defaultRow.id);
      }
    })().catch((error) => {
      agentsSchemaReadyPromise = null;
      throw error;
    });
  }

  await agentsSchemaReadyPromise;
}

async function getAgentListingCountMap() {
  const sql = getSql();
  const counts = new Map<string, number>();

  if (!sql || !(await propertyTableExists())) {
    return counts;
  }

  await ensurePropertyAgentColumn();

  const rows = asRows<{ agent_id: string | null; count: string }>(await sql`
    SELECT COALESCE(NULLIF(agent_id, ''), agent->>'id') AS agent_id,
           COUNT(*)::text AS count
    FROM properties
    GROUP BY COALESCE(NULLIF(agent_id, ''), agent->>'id')
  `);

  for (const row of rows) {
    if (row.agent_id) {
      counts.set(row.agent_id, Number(row.count));
    }
  }

  return counts;
}

export async function getAgents(options?: {
  includeInactive?: boolean;
}): Promise<ManagedPropertyAgent[]> {
  const sql = getSql();

  if (!sql) {
    const seeds = PROPERTY_AGENTS.map(mapSeedAgent);
    return sortAgents(
      options?.includeInactive ? seeds : seeds.filter((agent) => agent.isActive),
    );
  }

  try {
    await ensureAgentsSchema();

    const [rows, countMap] = await Promise.all([
      asRows<AgentRow>(await sql`
        SELECT id, slug, name, role, image_url, image_key, phone, email, whatsapp,
               bio, languages, specialties, areas, capabilities, is_active,
               is_default, sort_order
        FROM agents
        ORDER BY is_default DESC, sort_order ASC, name ASC
      `),
      getAgentListingCountMap(),
    ]);

    const agents = rows.map((row) =>
      mapAgentRowToAgent(row, countMap.get(row.id) ?? 0),
    );

    return sortAgents(
      options?.includeInactive
        ? agents
        : agents.filter((agent) => agent.isActive),
    );
  } catch {
    const seeds = PROPERTY_AGENTS.map(mapSeedAgent);
    return sortAgents(
      options?.includeInactive ? seeds : seeds.filter((agent) => agent.isActive),
    );
  }
}

export async function getActiveAgents() {
  return getAgents();
}

export async function getAgentById(
  id?: string | null,
  options?: { includeInactive?: boolean },
) {
  if (!id) {
    return undefined;
  }

  const agents = await getAgents({ includeInactive: options?.includeInactive ?? true });
  const agent = agents.find((entry) => entry.id === id);

  if (!agent || (!options?.includeInactive && !agent.isActive)) {
    return undefined;
  }

  return agent;
}

export async function getDefaultAgent() {
  const agents = await getAgents({ includeInactive: true });
  return (
    agents.find((agent) => agent.isDefault && agent.isActive) ??
    agents.find((agent) => agent.isActive) ??
    agents[0] ??
    mapSeedAgent(PROPERTY_AGENTS[0])
  );
}

async function createUniqueAgentSlug(baseValue: string, currentId?: string) {
  const sql = getSql();
  const baseSlug = slugifyPropertyValue(baseValue) || `agent-${Date.now()}`;

  if (!sql) {
    return baseSlug;
  }

  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const rows = asRows<{ id: string }>(await sql`
      SELECT id
      FROM agents
      WHERE slug = ${slug}
      LIMIT 1
    `);

    if (!rows[0] || rows[0].id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function normalizeAgentMutationInput(
  input: PropertyAgentMutationInput,
  fallbackSortOrder = 0,
) {
  const name = normalizeText(input.name, "Property Agent");
  const slug = slugifyPropertyValue(input.slug ?? name);
  const capabilities = normalizeCapabilities({
    ...DEFAULT_AGENT_CAPABILITIES,
    ...input.capabilities,
  });

  return {
    id: normalizeText(input.id) || undefined,
    slug,
    name,
    role: normalizeText(input.role, defaultPropertyAgent.role),
    image: normalizeText(input.image, defaultPropertyAgent.image),
    imageKey: normalizeText(input.imageKey) || undefined,
    phone: normalizeText(input.phone, defaultPropertyAgent.phone),
    email: normalizeText(input.email, defaultPropertyAgent.email),
    whatsapp: normalizeText(input.whatsapp, defaultPropertyAgent.whatsapp),
    bio: normalizeText(input.bio),
    languages: [...new Set((input.languages ?? []).map((entry) => entry.trim()).filter(Boolean))],
    specialties: [...new Set((input.specialties ?? []).map((entry) => entry.trim()).filter(Boolean))],
    areas: [...new Set((input.areas ?? []).map((entry) => entry.trim()).filter(Boolean))],
    capabilities,
    isActive: input.isDefault ? true : input.isActive ?? true,
    isDefault: input.isDefault ?? false,
    sortOrder: normalizeSortOrder(input.sortOrder, fallbackSortOrder),
  };
}

export async function upsertAgent(
  input: PropertyAgentMutationInput,
): Promise<ManagedPropertyAgent> {
  const sql = getSql();
  const agents = await getAgents({ includeInactive: true });
  const existingAgent = input.id
    ? agents.find((agent) => agent.id === input.id)
    : undefined;
  const normalized = normalizeAgentMutationInput(input, agents.length);
  const id =
    existingAgent?.id ??
    normalized.id ??
    `${slugifyPropertyValue(normalized.name) || "agent"}-${Date.now()}`;
  const slug = await createUniqueAgentSlug(
    normalized.slug || normalized.name,
    existingAgent?.id ?? id,
  );

  const nextAgent: ManagedPropertyAgent = {
    ...normalized,
    id,
    slug,
    listingCount: existingAgent?.listingCount ?? 0,
  };

  if (!sql) {
    return nextAgent;
  }

  await ensureAgentsSchema();

  if (nextAgent.isDefault) {
    await sql`
      UPDATE agents
      SET is_default = FALSE, updated_at = NOW()
      WHERE id <> ${nextAgent.id}
    `;
  }

  await sql`
    INSERT INTO agents (
      id,
      slug,
      name,
      role,
      image_url,
      image_key,
      phone,
      email,
      whatsapp,
      bio,
      languages,
      specialties,
      areas,
      capabilities,
      is_active,
      is_default,
      sort_order,
      updated_at
    ) VALUES (
      ${nextAgent.id},
      ${nextAgent.slug},
      ${nextAgent.name},
      ${nextAgent.role},
      ${nextAgent.image},
      ${nextAgent.imageKey ?? null},
      ${nextAgent.phone},
      ${nextAgent.email},
      ${nextAgent.whatsapp},
      ${nextAgent.bio},
      ${JSON.stringify(nextAgent.languages)}::jsonb,
      ${JSON.stringify(nextAgent.specialties)}::jsonb,
      ${JSON.stringify(nextAgent.areas)}::jsonb,
      ${JSON.stringify(nextAgent.capabilities)}::jsonb,
      ${nextAgent.isActive},
      ${nextAgent.isDefault},
      ${nextAgent.sortOrder},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      image_url = EXCLUDED.image_url,
      image_key = EXCLUDED.image_key,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      whatsapp = EXCLUDED.whatsapp,
      bio = EXCLUDED.bio,
      languages = EXCLUDED.languages,
      specialties = EXCLUDED.specialties,
      areas = EXCLUDED.areas,
      capabilities = EXCLUDED.capabilities,
      is_active = EXCLUDED.is_active,
      is_default = EXCLUDED.is_default,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
  `;

  await ensureDefaultAgentAfterMutation();
  await updatePropertyAgentSnapshots(nextAgent);

  const savedAgent = await getAgentById(nextAgent.id, { includeInactive: true });
  return savedAgent ?? nextAgent;
}

async function getAssignedPropertyCount(agentId: string) {
  const countMap = await getAgentListingCountMap();
  return countMap.get(agentId) ?? 0;
}

async function ensureDefaultAgentAfterMutation() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  const [{ count }] = asRows<{ count: string }>(await sql`
    SELECT COUNT(*)::text AS count
    FROM agents
    WHERE is_default = TRUE AND is_active = TRUE
  `);

  if (Number(count) > 0) {
    return;
  }

  await sql`
    UPDATE agents
    SET is_default = TRUE, updated_at = NOW()
    WHERE id = (
      SELECT id
      FROM agents
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name ASC
      LIMIT 1
    )
  `;
}

export async function deleteAgentById(id: string) {
  const sql = getSql();
  const agent = await getAgentById(id, { includeInactive: true });

  if (!agent) {
    return null;
  }

  if (!sql) {
    return agent;
  }

  await ensureAgentsSchema();

  if (agent.isDefault) {
    throw new Error("Set another default agent before deleting this one.");
  }

  const assignedCount = await getAssignedPropertyCount(agent.id);

  if (assignedCount > 0) {
    await sql`
      UPDATE agents
      SET is_active = FALSE, is_default = FALSE, updated_at = NOW()
      WHERE id = ${agent.id}
    `;
  } else {
    await sql`
      DELETE FROM agents
      WHERE id = ${agent.id}
    `;
  }

  await ensureDefaultAgentAfterMutation();
  return agent;
}

export async function updatePropertyAgentSnapshots(
  agent: ManagedPropertyAgent,
): Promise<AssignmentResult> {
  const sql = getSql();

  if (!sql || !(await propertyTableExists())) {
    return { count: 0, slugs: [] };
  }

  await ensurePropertyAgentColumn();

  const snapshot = toAgentSnapshot(agent);
  const rows = asRows<{ slug: string }>(await sql`
    UPDATE properties
    SET
      agent_id = ${agent.id},
      agent = ${JSON.stringify(snapshot)}::jsonb,
      updated_at = NOW()
    WHERE agent_id = ${agent.id} OR agent->>'id' = ${agent.id}
    RETURNING slug
  `);

  return {
    count: rows.length,
    slugs: rows.map((row) => row.slug),
  };
}

export async function assignPropertiesToAgent(
  agentId: string,
  propertyIds: number[],
): Promise<AssignmentResult> {
  const sql = getSql();
  const agent = await getAgentById(agentId, { includeInactive: true });

  if (!agent) {
    throw new Error("Agent not found.");
  }

  if (!agent.isActive) {
    throw new Error("Activate the agent before assigning listings.");
  }

  if (!sql || propertyIds.length === 0) {
    return { count: 0, slugs: [] };
  }

  await ensureAgentsSchema();
  await ensurePropertyAgentColumn();

  const uniqueIds = [...new Set(propertyIds.filter((id) => Number.isFinite(id)))];
  const slugs: string[] = [];
  const snapshot = toAgentSnapshot(agent);

  for (const propertyId of uniqueIds) {
    const rows = asRows<{ slug: string }>(await sql`
      UPDATE properties
      SET
        agent_id = ${agent.id},
        agent = ${JSON.stringify(snapshot)}::jsonb,
        updated_at = NOW()
      WHERE id = ${propertyId}
      RETURNING slug
    `);

    if (rows[0]?.slug) {
      slugs.push(rows[0].slug);
    }
  }

  return {
    count: slugs.length,
    slugs,
  };
}

async function getPropertyAssignmentRows() {
  const sql = getSql();

  if (!sql || !(await propertyTableExists())) {
    return [];
  }

  await ensurePropertyAgentColumn();

  return asRows<PropertyAssignmentRow>(await sql`
    SELECT id, slug, title, location, listing_type, visibility_status,
           usage, type, area, agent_id, agent
    FROM properties
    ORDER BY id ASC
  `);
}

function rowMatchesAssignmentFilters(
  row: PropertyAssignmentRow,
  filters: AgentAssignmentFilters,
) {
  const query = filters.query?.trim().toLowerCase();

  if (query) {
    const haystack = [
      row.id,
      row.slug,
      row.title,
      row.location,
      row.type,
      row.area,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(query)) {
      return false;
    }
  }

  if (
    filters.listingType &&
    filters.listingType !== "all" &&
    row.listing_type !== filters.listingType
  ) {
    return false;
  }

  if (
    filters.visibilityStatus &&
    filters.visibilityStatus !== "all" &&
    (row.visibility_status ?? PROPERTY_VISIBILITY_PUBLISHED) !==
      filters.visibilityStatus
  ) {
    return false;
  }

  if (
    filters.usage &&
    filters.usage !== "all" &&
    row.usage !== filters.usage
  ) {
    return false;
  }

  if (
    filters.propertyType &&
    filters.propertyType !== "all" &&
    row.type !== filters.propertyType
  ) {
    return false;
  }

  if (filters.area && filters.area !== "all" && row.area !== filters.area) {
    return false;
  }

  if (filters.currentAgentId && filters.currentAgentId !== "all") {
    const rowAgentId = row.agent_id ?? parseAgentIdFromSnapshot(row.agent);
    if (rowAgentId !== filters.currentAgentId) {
      return false;
    }
  }

  return true;
}

export async function assignAllMatchingPropertiesToAgent(
  agentId: string,
  filters: AgentAssignmentFilters,
) {
  const rows = await getPropertyAssignmentRows();
  const propertyIds = rows
    .filter((row) => rowMatchesAssignmentFilters(row, filters))
    .map((row) => Number(row.id))
    .filter((id) => Number.isFinite(id));

  return assignPropertiesToAgent(agentId, propertyIds);
}

export async function transferPropertiesBetweenAgents(
  fromAgentId: string,
  toAgentId: string,
) {
  return assignAllMatchingPropertiesToAgent(toAgentId, {
    currentAgentId: fromAgentId,
  });
}

export function resolveAgentSnapshot(agent?: Partial<PropertyAgent> | null) {
  return resolvePropertyAgent(agent);
}

export function normalizeAgentCapabilities(
  capabilities?: Partial<PropertyAgentCapabilities>,
) {
  return normalizeCapabilities({
    ...DEFAULT_AGENT_CAPABILITIES,
    ...capabilities,
  });
}

export function normalizeAgentVisibilityStatus(value: string) {
  return PROPERTY_VISIBILITY_STATUSES.includes(value as Property["visibilityStatus"])
    ? (value as Property["visibilityStatus"])
    : PROPERTY_VISIBILITY_PUBLISHED;
}
