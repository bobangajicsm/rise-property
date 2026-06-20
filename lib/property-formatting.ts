import { inferPropertyUsageFromTypeLabel } from "@/lib/property-types";
import { normalizePropertyUsage, type Property } from "@/types/property";

export function formatPrice(price: number) {
  return price.toLocaleString();
}

export function formatCompactPrice(
  price: number,
  listingType: Property["listingType"],
) {
  if (listingType === "rent") {
    return `QAR ${Math.round(price / 1000)}K`;
  }

  if (price >= 1_000_000) {
    return `QAR ${(price / 1_000_000).toFixed(1)}M`;
  }

  return `QAR ${Math.round(price / 1000)}K`;
}

export function extractSqftValue(sqft: string) {
  return sqft.split(" ")[0];
}

export function formatPropertyReference(id: number) {
  return `RSE-${String(id).padStart(4, "0")}`;
}

export function getPropertyUsage(
  propertyOrType: Pick<Property, "type" | "usage"> | Property["type"],
) {
  if (typeof propertyOrType !== "string" && propertyOrType.usage) {
    return normalizePropertyUsage(propertyOrType.usage);
  }

  const type =
    typeof propertyOrType === "string" ? propertyOrType : propertyOrType.type;

  return normalizePropertyUsage(inferPropertyUsageFromTypeLabel(type));
}
