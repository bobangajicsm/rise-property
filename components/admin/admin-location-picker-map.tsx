'use client';

import { useEffect } from "react";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import { createPinMarker } from "@/components/maps/leaflet-markers";
import { ColorTileLayer } from "@/components/maps/map-tiles";

interface AdminLocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (next: { lat: number; lng: number; location?: string }) => void;
}

function hasValidCoordinates(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function MapController({
  center,
}: {
  center: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);

  return null;
}

function MapEvents({
  onChange,
}: {
  onChange: (next: { lat: number; lng: number; location?: string }) => void;
}) {
  useMapEvents({
    async click(event) {
      const { lat, lng } = event.latlng;
      onChange({ lat, lng });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const payload = (await response.json()) as {
          display_name?: string;
        };

        if (payload.display_name) {
          onChange({
            lat,
            lng,
            location: payload.display_name,
          });
        }
      } catch {
        // Keep the selected coordinates even if reverse geocoding fails.
      }
    },
  });

  return null;
}

export function AdminLocationPickerMap({
  lat,
  lng,
  onChange,
}: AdminLocationPickerMapProps) {
  const fallbackCenter: [number, number] = [25.3694, 51.5511];
  const center = hasValidCoordinates(lat, lng) ? ([lat, lng] as [number, number]) : fallbackCenter;

  return (
    <div className="h-[220px] overflow-hidden rounded-2xl border border-gray-100 md:h-[320px]">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <ColorTileLayer />
        <Marker position={center} icon={createPinMarker()} />
        <MapEvents onChange={onChange} />
        <MapController center={center} />
      </MapContainer>
    </div>
  );
}
