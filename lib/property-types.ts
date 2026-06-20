import type {
  PropertyTypeConfig,
  PropertyTypeMutationInput,
  PropertyUsage,
} from "@/types/property";

export const DEFAULT_PROPERTY_TYPE_MUTATIONS: PropertyTypeMutationInput[] = [
  {
    id: "residential-apartment",
    label: "Apartment",
    usage: "residential",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "residential-villa",
    label: "Villa",
    usage: "residential",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "residential-penthouse",
    label: "Penthouse",
    usage: "residential",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "commercial-office",
    label: "Office",
    usage: "commercial",
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "commercial-shop",
    label: "Shop",
    usage: "commercial",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "international-property",
    label: "International Property",
    usage: "international",
    isActive: true,
    sortOrder: 0,
  },
];

const COMMERCIAL_TYPE_KEYWORDS = [
  "office",
  "retail",
  "shop",
  "showroom",
  "warehouse",
  "commercial",
  "building",
  "land",
  "international",
];

export function sanitizePropertyTypeLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function inferPropertyUsageFromTypeLabel(label: string): PropertyUsage {
  const normalizedLabel = sanitizePropertyTypeLabel(label).toLowerCase();

  return COMMERCIAL_TYPE_KEYWORDS.some((keyword) => normalizedLabel.includes(keyword))
    ? "commercial"
    : "residential";
}

export function slugifyPropertyTypeLabel(label: string) {
  return sanitizePropertyTypeLabel(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function createPropertyTypeId(
  label: string,
  usage: PropertyUsage,
  existingIds?: Set<string>,
) {
  const base = `${usage}-${slugifyPropertyTypeLabel(label) || "type"}`;

  if (!existingIds) {
    return base;
  }

  let nextId = base;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${base}-${suffix}`;
    suffix += 1;
  }

  existingIds.add(nextId);
  return nextId;
}

export function sortPropertyTypeConfigs<T extends Pick<PropertyTypeConfig, "sortOrder" | "label">>(
  entries: T[],
) {
  return [...entries].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.label.localeCompare(second.label);
  });
}

export function buildPropertyTypeOptions({
  propertyTypes,
  usage,
  fallbackLabels = [],
  includeInactive = false,
}: {
  propertyTypes: PropertyTypeConfig[];
  usage: PropertyUsage;
  fallbackLabels?: string[];
  includeInactive?: boolean;
}) {
  const options = sortPropertyTypeConfigs(
    propertyTypes.filter(
      (propertyType) =>
        propertyType.usage === usage && (includeInactive || propertyType.isActive),
    ),
  ).map((propertyType) => propertyType.label);

  const seen = new Set(options.map((option) => option.toLowerCase()));

  for (const label of fallbackLabels) {
    const sanitized = sanitizePropertyTypeLabel(label);

    if (!sanitized) {
      continue;
    }

    const key = sanitized.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      options.push(sanitized);
    }
  }

  return options;
}
