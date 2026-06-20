import { getSql } from "@/lib/neon";
import {
  createPropertyTypeId,
  DEFAULT_PROPERTY_TYPE_MUTATIONS,
  inferPropertyUsageFromTypeLabel,
  sanitizePropertyTypeLabel,
  sortPropertyTypeConfigs,
} from "@/lib/property-types";
import { getAllProperties } from "@/lib/properties-store";
import {
  PROPERTY_USAGE_RESIDENTIAL,
  normalizePropertyUsage,
  type Property,
  type PropertyTypeConfig,
  type PropertyTypeMutationInput,
  type PropertyUsage,
} from "@/types/property";

interface PropertyTypeRow {
  id: string;
  label: string;
  usage: PropertyUsage | string;
  is_active: boolean;
  sort_order: number | string;
}

let propertyTypesSchemaReadyPromise: Promise<void> | null = null;

function asRows<T>(value: unknown) {
  return value as T[];
}

function normalizeUsage(
  value: string,
  fallback: PropertyUsage = PROPERTY_USAGE_RESIDENTIAL,
): PropertyUsage {
  return normalizePropertyUsage(value, fallback);
}

function normalizeSortOrder(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function countListingsByType(properties: Property[]) {
  const counts = new Map<string, number>();

  for (const property of properties) {
    const usage = property.usage ?? inferPropertyUsageFromTypeLabel(property.type);
    const key = `${usage}:${sanitizePropertyTypeLabel(property.type).toLowerCase()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function mapRowToPropertyTypeConfig(
  row: PropertyTypeRow,
  listingCounts: Map<string, number>,
): PropertyTypeConfig {
  const usage = normalizeUsage(String(row.usage), inferPropertyUsageFromTypeLabel(row.label));
  const normalizedLabel = sanitizePropertyTypeLabel(row.label);

  return {
    id: row.id,
    label: normalizedLabel,
    usage,
    isActive: Boolean(row.is_active),
    sortOrder: normalizeSortOrder(row.sort_order, 0),
    listingCount: listingCounts.get(`${usage}:${normalizedLabel.toLowerCase()}`) ?? 0,
  };
}

function buildFallbackPropertyTypes(
  properties: Property[],
  seededEntries: PropertyTypeMutationInput[] = DEFAULT_PROPERTY_TYPE_MUTATIONS,
) {
  const listingCounts = countListingsByType(properties);
  const existingIds = new Set<string>();
  const seenKeys = new Set<string>();
  const normalizedEntries: PropertyTypeConfig[] = [];

  for (const entry of seededEntries) {
    const label = sanitizePropertyTypeLabel(entry.label);

    if (!label) {
      continue;
    }

    const usage = normalizeUsage(entry.usage);
    const dedupeKey = `${usage}:${label.toLowerCase()}`;

    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    seenKeys.add(dedupeKey);

    const id =
      entry.id && !existingIds.has(entry.id)
        ? (existingIds.add(entry.id), entry.id)
        : createPropertyTypeId(label, usage, existingIds);

    normalizedEntries.push({
      id,
      label,
      usage,
      isActive: entry.isActive,
      sortOrder: entry.sortOrder,
      listingCount: listingCounts.get(dedupeKey) ?? 0,
    });
  }

  for (const property of properties) {
    const label = sanitizePropertyTypeLabel(property.type);

    if (!label) {
      continue;
    }

    const usage = property.usage ?? inferPropertyUsageFromTypeLabel(label);
    const dedupeKey = `${usage}:${label.toLowerCase()}`;

    if (seenKeys.has(dedupeKey)) {
      continue;
    }

    seenKeys.add(dedupeKey);
    normalizedEntries.push({
      id: createPropertyTypeId(label, usage, existingIds),
      label,
      usage,
      isActive: true,
      sortOrder: normalizedEntries.filter((entry) => entry.usage === usage).length,
      listingCount: listingCounts.get(dedupeKey) ?? 0,
    });
  }

  return sortPropertyTypeConfigs(normalizedEntries);
}

async function ensurePropertyTypesSchema() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!propertyTypesSchemaReadyPromise) {
    propertyTypesSchemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS property_types (
          id TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          usage TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE property_types
        ADD COLUMN IF NOT EXISTS usage TEXT
      `;
      await sql`
        ALTER TABLE property_types
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE
      `;
      await sql`
        ALTER TABLE property_types
        ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0
      `;

      for (const entry of DEFAULT_PROPERTY_TYPE_MUTATIONS) {
        await sql`
          INSERT INTO property_types (
            id,
            label,
            usage,
            is_active,
            sort_order,
            updated_at
          ) VALUES (
            ${entry.id},
            ${entry.label},
            ${entry.usage},
            ${entry.isActive},
            ${entry.sortOrder},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            label = EXCLUDED.label,
            usage = EXCLUDED.usage,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        `;
      }
    })().catch((error) => {
      propertyTypesSchemaReadyPromise = null;
      throw error;
    });
  }

  await propertyTypesSchemaReadyPromise;
}

async function syncPropertyTypesFromInventory() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  await ensurePropertyTypesSchema();

  const rows = asRows<PropertyTypeRow>(await sql`
    SELECT id, label, usage, is_active, sort_order
    FROM property_types
  `);
  const existingIds = new Set(rows.map((row) => row.id));
  const existingKeys = new Set(
    rows.map((row) => {
      const usage = normalizeUsage(String(row.usage), inferPropertyUsageFromTypeLabel(row.label));
      return `${usage}:${sanitizePropertyTypeLabel(row.label).toLowerCase()}`;
    }),
  );
  const properties = await getAllProperties({ includeDrafts: true });
  const nextSortByUsage = new Map<PropertyUsage, number>();

  for (const row of rows) {
    const usage = normalizeUsage(String(row.usage), inferPropertyUsageFromTypeLabel(row.label));
    nextSortByUsage.set(
      usage,
      Math.max(
        nextSortByUsage.get(usage) ?? 0,
        normalizeSortOrder(row.sort_order, 0) + 1,
      ),
    );
  }

  for (const property of properties) {
    const label = sanitizePropertyTypeLabel(property.type);

    if (!label) {
      continue;
    }

    const usage = property.usage ?? inferPropertyUsageFromTypeLabel(label);
    const dedupeKey = `${usage}:${label.toLowerCase()}`;

    if (existingKeys.has(dedupeKey)) {
      continue;
    }

    existingKeys.add(dedupeKey);
    const sortOrder = nextSortByUsage.get(usage) ?? 0;
    nextSortByUsage.set(usage, sortOrder + 1);

    await sql`
      INSERT INTO property_types (
        id,
        label,
        usage,
        is_active,
        sort_order,
        updated_at
      ) VALUES (
        ${createPropertyTypeId(label, usage, existingIds)},
        ${label},
        ${usage},
        ${true},
        ${sortOrder},
        NOW()
      )
    `;
  }
}

function normalizeMutationEntries(entries: PropertyTypeMutationInput[]) {
  const existingIds = new Set<string>();
  const seenKeys = new Set<string>();

  const normalized = entries.flatMap((entry, index) => {
    const label = sanitizePropertyTypeLabel(entry.label);

    if (!label) {
      return [];
    }

    const usage = normalizeUsage(entry.usage, inferPropertyUsageFromTypeLabel(label));
    const dedupeKey = `${usage}:${label.toLowerCase()}`;

    if (seenKeys.has(dedupeKey)) {
      return [];
    }

    seenKeys.add(dedupeKey);
    const shouldReuseId = entry.id && !entry.id.startsWith("temp-") && !existingIds.has(entry.id);
    const id = shouldReuseId
      ? (existingIds.add(entry.id), entry.id)
      : createPropertyTypeId(label, usage, existingIds);

    return [
      {
        id,
        label,
        usage,
        isActive: Boolean(entry.isActive),
        sortOrder: normalizeSortOrder(entry.sortOrder, index),
      },
    ];
  });

  return normalized.length > 0 ? normalized : DEFAULT_PROPERTY_TYPE_MUTATIONS;
}

export async function getPropertyTypeConfigurations(): Promise<PropertyTypeConfig[]> {
  const properties = await getAllProperties({ includeDrafts: true });
  const sql = getSql();

  if (!sql) {
    return buildFallbackPropertyTypes(properties);
  }

  try {
    await ensurePropertyTypesSchema();
    await syncPropertyTypesFromInventory();

    const listingCounts = countListingsByType(properties);
    const rows = asRows<PropertyTypeRow>(await sql`
      SELECT id, label, usage, is_active, sort_order
      FROM property_types
      ORDER BY usage ASC, sort_order ASC, label ASC
    `);

    return sortPropertyTypeConfigs(
      rows.map((row) => mapRowToPropertyTypeConfig(row, listingCounts)),
    );
  } catch {
    return buildFallbackPropertyTypes(properties);
  }
}

export async function savePropertyTypeConfigurations(
  entries: PropertyTypeMutationInput[],
): Promise<PropertyTypeConfig[]> {
  const normalizedEntries = normalizeMutationEntries(entries);
  const sql = getSql();

  if (!sql) {
    const properties = await getAllProperties({ includeDrafts: true });
    return buildFallbackPropertyTypes(properties, normalizedEntries);
  }

  await ensurePropertyTypesSchema();
  await sql`DELETE FROM property_types`;

  for (const entry of normalizedEntries) {
    await sql`
      INSERT INTO property_types (
        id,
        label,
        usage,
        is_active,
        sort_order,
        updated_at
      ) VALUES (
        ${entry.id},
        ${entry.label},
        ${entry.usage},
        ${entry.isActive},
        ${entry.sortOrder},
        NOW()
      )
    `;
  }

  await syncPropertyTypesFromInventory();

  return getPropertyTypeConfigurations();
}
