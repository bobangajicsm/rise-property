import L from "leaflet";
import type { Property } from "@/types/property";
import { formatCompactPrice } from "@/lib/property-formatting";

export function createPriceMarker(
  property: Property,
  active: boolean,
) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-container ${active ? "active" : ""}">
        <div class="marker-price">${formatCompactPrice(property.price, property.listingType)}</div>
        <div class="marker-dot"></div>
      </div>
    `,
    iconSize: [84, 44],
    iconAnchor: [42, 44],
  });
}

export function createPinMarker() {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-container active">
        <div class="marker-dot" style="width: 14px; height: 14px; margin-top: 0;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function createNearbyPinMarker() {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-container">
        <div class="marker-dot" style="width: 10px; height: 10px; margin-top: 0; background: #9ca3af;"></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
