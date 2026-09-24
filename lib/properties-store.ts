import { MOCK_PROPERTIES } from "@/data/properties";
import { defaultPropertyAgent, resolvePropertyAgent } from "@/data/agents";
import { getAgentById } from "@/lib/agents-store";
import { getSql } from "@/lib/neon";
import { getPropertyUsage } from "@/lib/property-formatting";
import { buildPropertySlug } from "@/lib/property-slug";
import {
  LISTING_TYPES,
  PROPERTY_VISIBILITY_PUBLISHED,
  normalizePropertyUsage,
  normalizePropertyVisibilityStatus,
  type Property,
  type PropertyAgent,
  type PropertyMutationInput,
} from "@/types/property";

interface PropertyRow {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: number | string;
  period: string;
  beds: number | string;
  baths: number | string;
  sqft: string;
  images: unknown;
  badges: unknown;
  type: string;
  listing_type: Property["listingType"];
  visibility_status: Property["visibilityStatus"] | null;
  usage: Property["usage"] | null;
  area: string;
  lat: number | string;
  lng: number | string;
  description: string;
  features: unknown;
  year_built: number | string | null;
  parking: number | string | null;
  furnished: boolean | null;
  video_url: string | null;
  video_thumbnail: string | null;
  agent_id: string | null;
  agent: unknown;
  agent_ids: unknown;
  agents: unknown;
  created_at?: string;
  updated_at?: string;
}

interface GetPropertiesOptions {
  includeDrafts?: boolean;
}

let schemaReadyPromise: Promise<void> | null = null;

function asRows<T>(value: unknown) {
  return value as T[];
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

function parseAgent(value: unknown): PropertyAgent {
  const fallbackAgent: PropertyAgent = defaultPropertyAgent;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return resolvePropertyAgent(parsed as PropertyAgent);
      }
    } catch {
      return fallbackAgent;
    }
  }

  if (value && typeof value === "object") {
    return resolvePropertyAgent(value as PropertyAgent);
  }

  return fallbackAgent;
}

function parseAgentArray(value: unknown): PropertyAgent[] {
  let entries: unknown[] = [];

  if (Array.isArray(value)) {
    entries = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      entries = Array.isArray(parsed) ? parsed : [];
    } catch {
      entries = [];
    }
  }

  return entries
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => parseAgent(entry));
}

function toPropertyAgentSnapshot(agent: PropertyAgent): PropertyAgent {
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
    listingCount: agent.listingCount,
  };
}

function getAgentSnapshotId(agent?: PropertyAgent | null) {
  return agent?.id?.trim() || undefined;
}

function uniqueStrings(values: Array<string | null | undefined>) {
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

function uniqueAgents(agents: PropertyAgent[]) {
  const seen = new Set<string>();
  const output: PropertyAgent[] = [];

  for (const agent of agents) {
    const key = getAgentSnapshotId(agent) ?? `${agent.name}-${agent.email ?? ""}`;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(agent);
  }

  return output;
}

function normalizeNumericValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function normalizeNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRowToProperty(row: PropertyRow): Property {
  const primaryAgent = parseAgent(row.agent);
  const storedAgents = parseAgentArray(row.agents);
  const storedAgentIds = parseJsonArray(row.agent_ids);
  const primaryAgentId = row.agent_id?.trim() || getAgentSnapshotId(primaryAgent);
  const agentIds = uniqueStrings([
    primaryAgentId,
    ...storedAgentIds,
    ...storedAgents.map((agent) => getAgentSnapshotId(agent)),
  ]);
  const agentsById = new Map<string, PropertyAgent>();

  for (const agent of [primaryAgent, ...storedAgents]) {
    const agentId = getAgentSnapshotId(agent);

    if (agentId) {
      agentsById.set(agentId, agent);
    }
  }

  const orderedAgents = uniqueAgents([
    ...agentIds
      .map((agentId) => agentsById.get(agentId))
      .filter((agent): agent is PropertyAgent => Boolean(agent)),
    ...storedAgents,
    primaryAgent,
  ]);
  const resolvedPrimaryAgent =
    (agentIds[0] ? agentsById.get(agentIds[0]) : undefined) ??
    orderedAgents[0] ??
    primaryAgent;

  return {
    id: normalizeNumericValue(row.id),
    slug: row.slug,
    title: row.title,
    location: row.location,
    price: normalizeNumericValue(row.price),
    period: row.period,
    beds: normalizeNumericValue(row.beds),
    baths: normalizeNumericValue(row.baths),
    sqft: row.sqft,
    images: parseJsonArray(row.images),
    badges: parseJsonArray(row.badges),
    type: row.type,
    listingType: row.listing_type,
    visibilityStatus: normalizePropertyVisibilityStatus(row.visibility_status),
    usage: normalizePropertyUsage(
      row.usage,
      getPropertyUsage(row.type),
    ),
    area: row.area,
    lat: normalizeNumericValue(row.lat),
    lng: normalizeNumericValue(row.lng),
    description: row.description,
    features: parseJsonArray(row.features),
    yearBuilt: normalizeNullableNumber(row.year_built),
    parking: normalizeNullableNumber(row.parking),
    furnished: row.furnished ?? undefined,
    videoUrl: row.video_url ?? undefined,
    videoThumbnail: row.video_thumbnail ?? undefined,
    agentId: agentIds[0] ?? getAgentSnapshotId(resolvedPrimaryAgent),
    agent: resolvedPrimaryAgent,
    agentIds:
      agentIds.length > 0
        ? agentIds
        : uniqueStrings(orderedAgents.map((agent) => getAgentSnapshotId(agent))),
    agents: orderedAgents,
  };
}

function sortProperties(properties: Property[]) {
  return [...properties].sort((first, second) => first.id - second.id);
}

async function ensureSchema() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS properties (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          title TEXT NOT NULL,
          location TEXT NOT NULL,
          price NUMERIC NOT NULL,
          period TEXT NOT NULL DEFAULT '',
          beds INTEGER NOT NULL,
          baths INTEGER NOT NULL,
          sqft TEXT NOT NULL,
          images JSONB NOT NULL DEFAULT '[]'::jsonb,
          badges JSONB NOT NULL DEFAULT '[]'::jsonb,
          type TEXT NOT NULL,
          listing_type TEXT NOT NULL,
          visibility_status TEXT NOT NULL DEFAULT 'published',
          usage TEXT NOT NULL DEFAULT 'residential',
          area TEXT NOT NULL,
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          description TEXT NOT NULL,
          features JSONB NOT NULL DEFAULT '[]'::jsonb,
          year_built INTEGER,
          parking INTEGER,
          furnished BOOLEAN,
          video_url TEXT,
          video_thumbnail TEXT,
          agent_id TEXT,
          agent JSONB NOT NULL DEFAULT '{}'::jsonb,
          agent_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
          agents JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS visibility_status TEXT
      `;

      await sql`
        UPDATE properties
        SET visibility_status = 'published'
        WHERE visibility_status IS NULL OR visibility_status = ''
      `;

      await sql`
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS usage TEXT
      `;

      await sql`
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS agent_id TEXT
      `;

      await sql`
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS agent_ids JSONB NOT NULL DEFAULT '[]'::jsonb
      `;

      await sql`
        ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS agents JSONB NOT NULL DEFAULT '[]'::jsonb
      `;

      await sql`
        UPDATE properties
        SET agent_ids = jsonb_build_array(COALESCE(NULLIF(agent_id, ''), agent->>'id'))
        WHERE (
          agent_ids IS NULL
          OR jsonb_typeof(agent_ids) <> 'array'
          OR jsonb_array_length(agent_ids) = 0
        )
        AND COALESCE(NULLIF(agent_id, ''), agent->>'id') IS NOT NULL
      `;

      await sql`
        UPDATE properties
        SET agents = jsonb_build_array(agent)
        WHERE (
          agents IS NULL
          OR jsonb_typeof(agents) <> 'array'
          OR jsonb_array_length(agents) = 0
        )
        AND agent IS NOT NULL
        AND agent <> '{}'::jsonb
      `;

      await sql`
        UPDATE properties
        SET usage = CASE
          WHEN LOWER(type) LIKE '%office%' OR LOWER(type) LIKE '%shop%' THEN 'commercial'
          ELSE 'residential'
        END
        WHERE usage IS NULL OR usage = ''
      `;

      const [{ count }] = asRows<{ count: string }>(await sql`
        SELECT COUNT(*)::text AS count FROM properties
      `);

      if (Number(count) === 0) {
        for (const property of MOCK_PROPERTIES) {
          await sql`
            INSERT INTO properties (
              id,
              slug,
              title,
              location,
              price,
              period,
              beds,
              baths,
              sqft,
              images,
              badges,
              type,
              listing_type,
              visibility_status,
              usage,
              area,
              lat,
              lng,
              description,
              features,
              year_built,
              parking,
              furnished,
              video_url,
              video_thumbnail,
              agent_id,
              agent,
              agent_ids,
              agents
            ) VALUES (
              ${property.id},
              ${property.slug},
              ${property.title},
              ${property.location},
              ${property.price},
              ${property.period},
              ${property.beds},
              ${property.baths},
              ${property.sqft},
              ${JSON.stringify(property.images)}::jsonb,
              ${JSON.stringify(property.badges)}::jsonb,
              ${property.type},
              ${property.listingType},
              ${property.visibilityStatus},
              ${property.usage},
              ${property.area},
              ${property.lat},
              ${property.lng},
              ${property.description},
              ${JSON.stringify(property.features)}::jsonb,
              ${property.yearBuilt ?? null},
              ${property.parking ?? null},
              ${property.furnished ?? null},
              ${property.videoUrl ?? null},
              ${property.videoThumbnail ?? null},
              ${property.agent.id ?? null},
              ${JSON.stringify(property.agent)}::jsonb,
              ${JSON.stringify(property.agentIds ?? [property.agent.id].filter(Boolean))}::jsonb,
              ${JSON.stringify(property.agents ?? [property.agent])}::jsonb
            )
            ON CONFLICT (slug) DO NOTHING
          `;
        }

        await sql`
          SELECT setval(
            pg_get_serial_sequence('properties', 'id'),
            GREATEST((SELECT COALESCE(MAX(id), 0) + 1 FROM properties), 1),
            false
          )
        `;
      }
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  await schemaReadyPromise;
}

async function sanitizePropertyInput(input: PropertyMutationInput) {
  const normalizedId =
    typeof input.id === "number" && Number.isFinite(input.id) ? input.id : null;
  const fallbackImages =
    input.images.length > 0 ? input.images : [MOCK_PROPERTIES[0]?.images[0] ?? ""];
  const requestedAgentIds = uniqueStrings([
    input.agentId,
    ...(input.agentIds ?? []),
    ...(input.agents ?? []).map((agent) => getAgentSnapshotId(agent)),
  ]);
  const liveAgents = await Promise.all(
    requestedAgentIds.map((agentId) =>
      getAgentById(agentId, { includeInactive: true }),
    ),
  );
  const fallbackAgent = toPropertyAgentSnapshot(resolvePropertyAgent(input.agent));
  const resolvedAgents = uniqueAgents([
    ...liveAgents
      .filter((agent): agent is NonNullable<typeof agent> => Boolean(agent))
      .map((agent) => toPropertyAgentSnapshot(agent)),
    ...(input.agents ?? [])
      .map((agent) => toPropertyAgentSnapshot(resolvePropertyAgent(agent)))
      .filter((agent) => getAgentSnapshotId(agent)),
    fallbackAgent,
  ]);
  const resolvedAgentIds = uniqueStrings([
    input.agentId,
    ...requestedAgentIds,
    ...resolvedAgents.map((agent) => getAgentSnapshotId(agent)),
  ]);
  const orderedAgents = uniqueAgents([
    ...resolvedAgentIds
      .map((agentId) =>
        resolvedAgents.find((agent) => getAgentSnapshotId(agent) === agentId),
      )
      .filter((agent): agent is PropertyAgent => Boolean(agent)),
    fallbackAgent,
  ]);
  const resolvedAgent = orderedAgents[0] ?? fallbackAgent;
  const agentIds = uniqueStrings([
    getAgentSnapshotId(resolvedAgent),
    ...resolvedAgentIds,
  ]);

  return {
    id: normalizedId,
    slug: buildPropertySlug(input.title, normalizedId),
    title: input.title.trim(),
    location: input.location.trim(),
    price: Number(input.price),
    period: input.period ?? (input.listingType === LISTING_TYPES[1] ? "/month" : ""),
    beds: Number(input.beds),
    baths: Number(input.baths),
    sqft: input.sqft.trim(),
    images: fallbackImages.filter(Boolean),
    badges: input.badges.filter(Boolean),
    type: input.type.trim(),
    listingType: input.listingType,
    visibilityStatus: normalizePropertyVisibilityStatus(input.visibilityStatus),
    usage: normalizePropertyUsage(input.usage, getPropertyUsage(input.type)),
    area: input.area.trim(),
    lat: Number(input.lat),
    lng: Number(input.lng),
    description: input.description.trim(),
    features: input.features.filter(Boolean),
    yearBuilt: normalizeNullableNumber(input.yearBuilt),
    parking: normalizeNullableNumber(input.parking),
    furnished:
      typeof input.furnished === "boolean" ? input.furnished : undefined,
    videoUrl: input.videoUrl?.trim() || undefined,
    videoThumbnail: input.videoThumbnail?.trim() || undefined,
    agentId: getAgentSnapshotId(resolvedAgent),
    agent: resolvedAgent,
    agentIds,
    agents: orderedAgents,
  };
}

export async function getAllProperties(
  options?: GetPropertiesOptions,
): Promise<Property[]> {
  const sql = getSql();
  const includeDrafts = options?.includeDrafts ?? false;

  if (!sql) {
    return sortProperties(
      includeDrafts
        ? MOCK_PROPERTIES
        : MOCK_PROPERTIES.filter(
            (property) => property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED,
          ),
    );
  }

  try {
    await ensureSchema();
    const rows = includeDrafts
      ? asRows<PropertyRow>(await sql`
          SELECT *
          FROM properties
          ORDER BY id ASC
        `)
      : asRows<PropertyRow>(await sql`
          SELECT *
          FROM properties
          WHERE visibility_status = ${PROPERTY_VISIBILITY_PUBLISHED}
          ORDER BY id ASC
        `);

    return rows.map(mapRowToProperty);
  } catch {
    return sortProperties(
      includeDrafts
        ? MOCK_PROPERTIES
        : MOCK_PROPERTIES.filter(
            (property) => property.visibilityStatus === PROPERTY_VISIBILITY_PUBLISHED,
          ),
    );
  }
}

export async function getRecommendedProperties(limit = 4): Promise<Property[]> {
  const properties = await getAllProperties();
  return properties.slice(0, limit);
}

export async function getPropertyById(id: number): Promise<Property | undefined> {
  const properties = await getAllProperties({ includeDrafts: true });
  return properties.find((property) => property.id === id);
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | undefined> {
  const properties = await getAllProperties();
  return properties.find((property) => property.slug === slug);
}

export async function getPropertiesByListingType(
  type: Property["listingType"],
): Promise<Property[]> {
  const properties = await getAllProperties();
  return properties.filter((property) => property.listingType === type);
}

export async function getPropertiesByArea(areaName: string): Promise<Property[]> {
  const properties = await getAllProperties();
  return properties.filter((property) => property.area === areaName);
}

export async function getRelatedProperties(
  property: Property,
  limit = 8,
): Promise<Property[]> {
  const properties = await getAllProperties();
  return properties
    .filter(
      (entry) => entry.id !== property.id && entry.area === property.area,
    )
    .slice(0, limit);
}

export async function addAgentToProperty(
  propertyId: number,
  agentId: string,
): Promise<Property> {
  const property = await getPropertyById(propertyId);
  const agent = await getAgentById(agentId, { includeInactive: true });

  if (!property) {
    throw new Error("Listing not found.");
  }

  if (!agent) {
    throw new Error("Agent not found.");
  }

  if (!agent.isActive) {
    throw new Error("Activate the agent before assigning listings.");
  }

  const agentSnapshot = toPropertyAgentSnapshot(agent);
  const nextAgentIds = uniqueStrings([
    property.agentId,
    ...(property.agentIds ?? []),
    agentSnapshot.id,
  ]);
  const nextAgents = uniqueAgents([
    property.agent,
    ...(property.agents ?? []),
    agentSnapshot,
  ]);

  return upsertProperty({
    ...property,
    agentId: property.agentId ?? nextAgentIds[0],
    agent: property.agent,
    agentIds: nextAgentIds,
    agents: nextAgents,
  });
}

export async function upsertProperty(
  input: PropertyMutationInput,
): Promise<Property> {
  const sql = getSql();
  const sanitized = await sanitizePropertyInput(input);

  if (!sql) {
    return {
      ...sanitized,
      id: sanitized.id ?? MOCK_PROPERTIES.length + 1,
      slug: buildPropertySlug(
        sanitized.title,
        sanitized.id ?? MOCK_PROPERTIES.length + 1,
      ),
      visibilityStatus: sanitized.visibilityStatus,
      usage: sanitized.usage,
      agentId: sanitized.agentId,
      agent: sanitized.agent,
      agentIds: sanitized.agentIds,
      agents: sanitized.agents,
    };
  }

  await ensureSchema();

  if (sanitized.id !== null) {
    const rows = asRows<PropertyRow>(await sql`
      UPDATE properties
      SET
        slug = ${sanitized.slug},
        title = ${sanitized.title},
        location = ${sanitized.location},
        price = ${sanitized.price},
        period = ${sanitized.period},
        beds = ${sanitized.beds},
        baths = ${sanitized.baths},
        sqft = ${sanitized.sqft},
        images = ${JSON.stringify(sanitized.images)}::jsonb,
        badges = ${JSON.stringify(sanitized.badges)}::jsonb,
        type = ${sanitized.type},
        listing_type = ${sanitized.listingType},
        visibility_status = ${sanitized.visibilityStatus},
        usage = ${sanitized.usage},
        area = ${sanitized.area},
        lat = ${sanitized.lat},
        lng = ${sanitized.lng},
        description = ${sanitized.description},
        features = ${JSON.stringify(sanitized.features)}::jsonb,
        year_built = ${sanitized.yearBuilt ?? null},
        parking = ${sanitized.parking ?? null},
        furnished = ${sanitized.furnished ?? null},
        video_url = ${sanitized.videoUrl ?? null},
        video_thumbnail = ${sanitized.videoThumbnail ?? null},
        agent_id = ${sanitized.agentId ?? null},
        agent = ${JSON.stringify(sanitized.agent)}::jsonb,
        agent_ids = ${JSON.stringify(sanitized.agentIds)}::jsonb,
        agents = ${JSON.stringify(sanitized.agents)}::jsonb,
        updated_at = NOW()
      WHERE id = ${sanitized.id}
      RETURNING *
    `);

    if (rows[0]) {
      return mapRowToProperty(rows[0]);
    }
  }

  const rows = asRows<PropertyRow>(await sql`
    INSERT INTO properties (
      slug,
      title,
      location,
      price,
      period,
      beds,
      baths,
      sqft,
      images,
      badges,
      type,
      listing_type,
      visibility_status,
      usage,
      area,
      lat,
      lng,
      description,
      features,
      year_built,
      parking,
      furnished,
      video_url,
      video_thumbnail,
      agent_id,
      agent,
      agent_ids,
      agents
    ) VALUES (
      ${`temp-${buildPropertySlug(sanitized.title)}-${Date.now()}`},
      ${sanitized.title},
      ${sanitized.location},
      ${sanitized.price},
      ${sanitized.period},
      ${sanitized.beds},
      ${sanitized.baths},
      ${sanitized.sqft},
      ${JSON.stringify(sanitized.images)}::jsonb,
      ${JSON.stringify(sanitized.badges)}::jsonb,
      ${sanitized.type},
      ${sanitized.listingType},
      ${sanitized.visibilityStatus},
      ${sanitized.usage},
      ${sanitized.area},
      ${sanitized.lat},
      ${sanitized.lng},
      ${sanitized.description},
      ${JSON.stringify(sanitized.features)}::jsonb,
      ${sanitized.yearBuilt ?? null},
      ${sanitized.parking ?? null},
      ${sanitized.furnished ?? null},
      ${sanitized.videoUrl ?? null},
      ${sanitized.videoThumbnail ?? null},
      ${sanitized.agentId ?? null},
      ${JSON.stringify(sanitized.agent)}::jsonb,
      ${JSON.stringify(sanitized.agentIds)}::jsonb,
      ${JSON.stringify(sanitized.agents)}::jsonb
    )
    RETURNING *
  `);

  const inserted = rows[0];
  const stableSlug = buildPropertySlug(inserted.title, inserted.id);

  const updatedRows = asRows<PropertyRow>(await sql`
    UPDATE properties
    SET slug = ${stableSlug}, updated_at = NOW()
    WHERE id = ${inserted.id}
    RETURNING *
  `);

  return mapRowToProperty(updatedRows[0]);
}

export async function deletePropertyById(
  id: number,
): Promise<Property | null> {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  await ensureSchema();

  const rows = asRows<PropertyRow>(await sql`
    DELETE FROM properties
    WHERE id = ${id}
    RETURNING *
  `);

  return rows[0] ? mapRowToProperty(rows[0]) : null;
}
