'use client';

import { MapContainer, Marker, Popup } from "react-leaflet";
import {
  createNearbyPinMarker,
  createPinMarker,
} from "@/components/maps/leaflet-markers";
import { ColorTileLayer } from "@/components/maps/map-tiles";
import { formatPrice } from "@/lib/property-formatting";
import type { Property } from "@/types/property";

interface PropertyPreviewMapProps {
  nearbyProperties: Property[];
  property: Property;
}

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

export function PropertyPreviewMap({
  nearbyProperties,
  property,
}: PropertyPreviewMapProps) {
  const propertyLat = normalizeCoordinate(property.lat) ?? 25.2854;
  const propertyLng = normalizeCoordinate(property.lng) ?? 51.531;
  const nearbyWithCoordinates = nearbyProperties
    .map((nearby) => ({
      ...nearby,
      lat: normalizeCoordinate(nearby.lat),
      lng: normalizeCoordinate(nearby.lng),
    }))
    .filter(
      (nearby): nearby is Property & { lat: number; lng: number } =>
        nearby.lat !== null && nearby.lng !== null,
    );

  return (
    <MapContainer
      center={[propertyLat, propertyLng]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <ColorTileLayer />
      <Marker position={[propertyLat, propertyLng]} icon={createPinMarker()}>
        <Popup>
          <div className="min-w-[150px] p-2 text-center">
            <p className="mb-1 text-xs font-bold text-black">Current Property</p>
            <p className="text-[10px] font-bold tracking-widest text-accent uppercase">
              QAR {formatPrice(property.price)}
            </p>
          </div>
        </Popup>
      </Marker>
      {nearbyWithCoordinates.map((nearby) => (
        <Marker
          key={nearby.id}
          position={[nearby.lat, nearby.lng]}
          icon={createNearbyPinMarker()}
        >
          <Popup>
            <div className="min-w-[150px] p-1">
              <p className="mb-1 text-[10px] font-bold text-black">
                {nearby.title}
              </p>
              <p className="text-[9px] font-bold text-accent">
                QAR {formatPrice(nearby.price)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
