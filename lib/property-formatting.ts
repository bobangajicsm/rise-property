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

function parseSizeValue(size: string) {
  const numericValue = Number.parseFloat(size.replace(/,/g, "").match(/[\d.]+/)?.[0] ?? "");
  return Number.isFinite(numericValue) ? numericValue : null;
}

function isSquareFeet(size: string) {
  return /\b(sq\s*ft|sqft|ft2|ft²|square\s*feet)\b/i.test(size);
}

function formatAreaNumber(value: number) {
  return Math.round(value).toLocaleString();
}

export function getSquareMeterValue(size: string) {
  const numericValue = parseSizeValue(size);

  if (numericValue === null) {
    return "";
  }

  return formatAreaNumber(isSquareFeet(size) ? numericValue * 0.09290304 : numericValue);
}

export function formatAreaSize(size: string) {
  const squareMeters = getSquareMeterValue(size);
  return squareMeters ? `${squareMeters} m²` : size;
}

export function extractSqftValue(sqft: string) {
  return getSquareMeterValue(sqft) || sqft.split(" ")[0];
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
