import type { Property } from "@/types/property";

function normalizeCoordinate(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export interface DrawnMapItem {
  id: number;
  layerType: "polygon" | "rectangle" | "circle";
  latlngs?: Array<Array<{ lat: number; lng: number }>>;
  latlng?: { lat: number; lng: number };
  radius?: number;
}

function isPointInPolygon(
  point: [number, number],
  vertices: [number, number][],
) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0];
    const yi = vertices[i][1];
    const xj = vertices[j][0];
    const yj = vertices[j][1];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isPointInCircle(
  point: [number, number],
  center: [number, number],
  radius: number,
) {
  const earthRadius = 6371e3;
  const lat1 = (point[0] * Math.PI) / 180;
  const lat2 = (center[0] * Math.PI) / 180;
  const deltaLat = ((center[0] - point[0]) * Math.PI) / 180;
  const deltaLng = ((center[1] - point[1]) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c <= radius;
}

function isPointInRectangle(
  point: [number, number],
  bounds: Array<{ lat: number; lng: number }>,
) {
  const lats = bounds.map((entry) => entry.lat);
  const lngs = bounds.map((entry) => entry.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    point[0] >= minLat &&
    point[0] <= maxLat &&
    point[1] >= minLng &&
    point[1] <= maxLng
  );
}

export function hasValidPropertyCoordinates(property: Property) {
  return (
    normalizeCoordinate(property.lat) !== null &&
    normalizeCoordinate(property.lng) !== null
  );
}

export function applyDrawnMapFilters(
  properties: Property[],
  drawnItems: DrawnMapItem[],
) {
  if (drawnItems.length === 0) {
    return properties;
  }

  return properties.filter((property) => {
    if (!hasValidPropertyCoordinates(property)) {
      return false;
    }

    const point: [number, number] = [property.lat, property.lng];

    return drawnItems.some((item) => {
      if (
        (item.layerType === "polygon" || item.layerType === "rectangle") &&
        item.latlngs?.[0]?.length
      ) {
        if (item.layerType === "polygon") {
          return isPointInPolygon(
            point,
            item.latlngs[0].map((entry) => [entry.lat, entry.lng]),
          );
        }

        return isPointInRectangle(point, item.latlngs[0]);
      }

      if (item.layerType === "circle" && item.latlng && item.radius) {
        return isPointInCircle(
          point,
          [item.latlng.lat, item.latlng.lng],
          item.radius,
        );
      }

      return false;
    });
  });
}
