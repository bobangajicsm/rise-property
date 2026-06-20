import { AREAS, FEATURED_AREAS, MOCK_PROPERTIES } from "@/data/properties";
import { getSql } from "@/lib/neon";
import { getAllProperties } from "@/lib/properties-store";
import type {
  FeaturedAreaConfig,
  FeaturedAreaMutationInput,
  Property,
} from "@/types/property";

interface FeaturedAreaRow {
  area_name: string;
  center_lat: number | string | null;
  center_lng: number | string | null;
  base_image: string | null;
  is_premium: boolean;
  cover_image: string | null;
}

let featuredAreasSchemaReadyPromise: Promise<void> | null = null;

function asRows<T>(value: unknown) {
  return value as T[];
}

function normalizeNumber(value: number | string | null | undefined, fallback: number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function sanitizeImage(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveAreaImage({
  areaName,
  manualCoverImage,
  baseImage,
  properties,
  randomizeInventoryCovers,
}: {
  areaName: string;
  manualCoverImage?: string;
  baseImage: string;
  properties: Property[];
  randomizeInventoryCovers: boolean;
}) {
  if (manualCoverImage) {
    return {
      image: manualCoverImage,
      source: "manual" as const,
    };
  }

  const inventoryImages = properties
    .filter((property) => property.area === areaName)
    .flatMap((property) => property.images.filter(Boolean));

  if (inventoryImages.length > 0) {
    const image =
      inventoryImages[
        randomizeInventoryCovers
          ? Math.floor(Math.random() * inventoryImages.length)
          : 0
      ];

    return {
      image,
      source: "inventory" as const,
    };
  }

  return {
    image: baseImage,
    source: "default" as const,
  };
}

function buildFallbackAreaConfigs(
  properties: Property[],
  randomizeInventoryCovers: boolean,
): FeaturedAreaConfig[] {
  const featuredNames = new Set(FEATURED_AREAS.map((area) => area.name));

  return AREAS.map((area) => {
    const imageMeta = resolveAreaImage({
      areaName: area.name,
      manualCoverImage: undefined,
      baseImage: area.image,
      properties,
      randomizeInventoryCovers,
    });

    return {
      ...area,
      image: imageMeta.image,
      baseImage: area.image,
      isPremium: featuredNames.has(area.name),
      listingCount: properties.filter((property) => property.area === area.name).length,
      coverImage: undefined,
      coverSource: imageMeta.source,
    };
  });
}

async function ensureFeaturedAreasSchema() {
  const sql = getSql();

  if (!sql) {
    return;
  }

  if (!featuredAreasSchemaReadyPromise) {
    featuredAreasSchemaReadyPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS featured_areas (
          area_name TEXT PRIMARY KEY,
          center_lat DOUBLE PRECISION,
          center_lng DOUBLE PRECISION,
          base_image TEXT,
          is_premium BOOLEAN NOT NULL DEFAULT FALSE,
          cover_image TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE featured_areas
        ADD COLUMN IF NOT EXISTS center_lat DOUBLE PRECISION
      `;
      await sql`
        ALTER TABLE featured_areas
        ADD COLUMN IF NOT EXISTS center_lng DOUBLE PRECISION
      `;
      await sql`
        ALTER TABLE featured_areas
        ADD COLUMN IF NOT EXISTS base_image TEXT
      `;

      const [{ count }] = asRows<{ count: string }>(await sql`
        SELECT COUNT(*)::text AS count FROM featured_areas
      `);

      if (Number(count) === 0) {
        for (const area of AREAS) {
          await sql`
            INSERT INTO featured_areas (
              area_name,
              center_lat,
              center_lng,
              base_image,
              is_premium,
              cover_image
            ) VALUES (
              ${area.name},
              ${area.center[0]},
              ${area.center[1]},
              ${area.image},
              ${FEATURED_AREAS.some((entry) => entry.name === area.name)},
              ${null}
            )
            ON CONFLICT (area_name) DO NOTHING
          `;
        }
      } else {
        for (const area of AREAS) {
          await sql`
            UPDATE featured_areas
            SET
              center_lat = COALESCE(center_lat, ${area.center[0]}),
              center_lng = COALESCE(center_lng, ${area.center[1]}),
              base_image = COALESCE(base_image, ${area.image})
            WHERE area_name = ${area.name}
          `;
        }
      }
    })().catch((error) => {
      featuredAreasSchemaReadyPromise = null;
      throw error;
    });
  }

  await featuredAreasSchemaReadyPromise;
}

async function getAreaRows() {
  const sql = getSql();

  if (!sql) {
    return null;
  }

  try {
    await ensureFeaturedAreasSchema();

    return asRows<FeaturedAreaRow>(await sql`
      SELECT area_name, center_lat, center_lng, base_image, is_premium, cover_image
      FROM featured_areas
      ORDER BY area_name ASC
    `);
  } catch {
    return null;
  }
}

function mapRowToFeaturedAreaConfig(
  row: FeaturedAreaRow,
  properties: Property[],
  randomizeInventoryCovers: boolean,
): FeaturedAreaConfig {
  const defaultArea = AREAS.find((area) => area.name === row.area_name);
  const center: [number, number] = [
    normalizeNumber(row.center_lat, defaultArea?.center[0] ?? 25.3694),
    normalizeNumber(row.center_lng, defaultArea?.center[1] ?? 51.5511),
  ];
  const baseImage = sanitizeImage(row.base_image) ?? defaultArea?.image ?? MOCK_PROPERTIES[0]?.images[0] ?? "";
  const manualCoverImage = sanitizeImage(row.cover_image);
  const imageMeta = resolveAreaImage({
    areaName: row.area_name,
    manualCoverImage,
    baseImage,
    properties,
    randomizeInventoryCovers,
  });

  return {
    name: row.area_name,
    center,
    image: imageMeta.image,
    baseImage,
    isPremium: row.is_premium,
    listingCount: properties.filter((property) => property.area === row.area_name).length,
    coverImage: manualCoverImage,
    coverSource: imageMeta.source,
  };
}

export async function getFeaturedAreaConfigurations(
  options?: { randomizeInventoryCovers?: boolean },
): Promise<FeaturedAreaConfig[]> {
  const properties = await getAllProperties();
  const rows = await getAreaRows();

  if (!rows) {
    return buildFallbackAreaConfigs(
      properties.length > 0 ? properties : MOCK_PROPERTIES,
      options?.randomizeInventoryCovers ?? false,
    );
  }

  return rows.map((row) =>
    mapRowToFeaturedAreaConfig(
      row,
      properties,
      options?.randomizeInventoryCovers ?? false,
    ),
  );
}

export async function getPremiumAreaConfigurations(): Promise<FeaturedAreaConfig[]> {
  const areas = await getFeaturedAreaConfigurations({
    randomizeInventoryCovers: true,
  });

  return areas.filter((area) => area.isPremium);
}

export async function saveFeaturedAreaConfigurations(
  entries: FeaturedAreaMutationInput[],
): Promise<FeaturedAreaConfig[]> {
  const sql = getSql();

  if (!sql) {
    return getFeaturedAreaConfigurations();
  }

  await ensureFeaturedAreasSchema();

  const normalizedEntries = entries.map((entry) => ({
    name: entry.name.trim(),
    center: [
      normalizeNumber(entry.center[0], 25.3694),
      normalizeNumber(entry.center[1], 51.5511),
    ] as [number, number],
    baseImage: sanitizeImage(entry.baseImage) ?? MOCK_PROPERTIES[0]?.images[0] ?? "",
    isPremium: entry.isPremium,
    coverImage: sanitizeImage(entry.coverImage) ?? null,
  }));

  await sql`DELETE FROM featured_areas`;

  for (const entry of normalizedEntries) {
    await sql`
      INSERT INTO featured_areas (
        area_name,
        center_lat,
        center_lng,
        base_image,
        is_premium,
        cover_image,
        updated_at
      ) VALUES (
        ${entry.name},
        ${entry.center[0]},
        ${entry.center[1]},
        ${entry.baseImage},
        ${entry.isPremium},
        ${entry.coverImage},
        NOW()
      )
      ON CONFLICT (area_name) DO UPDATE
      SET
        center_lat = EXCLUDED.center_lat,
        center_lng = EXCLUDED.center_lng,
        base_image = EXCLUDED.base_image,
        is_premium = EXCLUDED.is_premium,
        cover_image = EXCLUDED.cover_image,
        updated_at = NOW()
    `;
  }

  return getFeaturedAreaConfigurations();
}
