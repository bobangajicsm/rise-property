'use client';

import { useRef } from "react";
import { Info, X } from "lucide-react";
import {
  FeatureGroup,
  MapContainer,
  Marker,
  Popup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { createPinMarker } from "@/components/maps/leaflet-markers";
import { ColorTileLayer } from "@/components/maps/map-tiles";
import { DrawnMapItem, hasValidPropertyCoordinates } from "@/lib/map-filters";
import { formatPrice } from "@/lib/property-formatting";
import type { Property } from "@/types/property";

interface AreaPropertiesMapProps {
  center: [number, number];
  drawnItems: DrawnMapItem[];
  properties: Property[];
  onDrawnItemsChange: (items: DrawnMapItem[]) => void;
  onViewProperty: (id: number) => void;
}

export function AreaPropertiesMap({
  center,
  drawnItems,
  properties,
  onDrawnItemsChange,
  onViewProperty,
}: AreaPropertiesMapProps) {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const propertiesWithCoordinates = properties.filter(hasValidPropertyCoordinates);

  function clearDrawFilters() {
    onDrawnItemsChange([]);
    featureGroupRef.current?.clearLayers();
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-full border border-gray-100 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md">
        <Info className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">
          {drawnItems.length > 0
            ? "Area Filter Active"
            : "Draw on map to filter properties"}
        </span>
        {drawnItems.length > 0 ? (
          <button
            type="button"
            onClick={clearDrawFilters}
            className="text-[10px] font-bold text-accent transition-colors hover:text-black"
          >
            Clear
          </button>
        ) : null}
      </div>

      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <ColorTileLayer />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={(event) => {
              const id = L.stamp(event.layer);

              if (
                (event.layerType === "polygon" || event.layerType === "rectangle") &&
                "getLatLngs" in event.layer
              ) {
                onDrawnItemsChange([
                  ...drawnItems,
                  {
                    id,
                    layerType: event.layerType,
                    latlngs: event.layer
                      .getLatLngs()
                      .map((group: L.LatLng[]) =>
                        group.map((entry) => ({ lat: entry.lat, lng: entry.lng })),
                      ),
                  } as DrawnMapItem,
                ]);
                return;
              }

              if (event.layerType === "circle" && "getLatLng" in event.layer) {
                onDrawnItemsChange([
                  ...drawnItems,
                  {
                    id,
                    layerType: "circle",
                    latlng: {
                      lat: event.layer.getLatLng().lat,
                      lng: event.layer.getLatLng().lng,
                    },
                    radius:
                      "getRadius" in event.layer ? event.layer.getRadius() : undefined,
                  },
                ]);
              }
            }}
            onEdited={(event) => {
              const nextItems = [...drawnItems];

              event.layers.eachLayer((layer: L.Layer) => {
                const id = L.stamp(layer);
                const index = nextItems.findIndex((item) => item.id === id);

                if (index === -1) {
                  return;
                }

                if ("getLatLngs" in layer && typeof layer.getLatLngs === "function") {
                  nextItems[index] = {
                    ...nextItems[index],
                    latlngs: layer.getLatLngs().map((group: L.LatLng[]) =>
                      group.map((entry) => ({ lat: entry.lat, lng: entry.lng })),
                    ),
                  };
                }

                if ("getLatLng" in layer && typeof layer.getLatLng === "function") {
                  nextItems[index] = {
                    ...nextItems[index],
                    latlng: {
                      lat: layer.getLatLng().lat,
                      lng: layer.getLatLng().lng,
                    },
                    radius:
                      "getRadius" in layer && typeof layer.getRadius === "function"
                        ? layer.getRadius()
                        : nextItems[index].radius,
                  };
                }
              });

              onDrawnItemsChange(nextItems);
            }}
            onDeleted={(event) => {
              const deletedIds: number[] = [];

              event.layers.eachLayer((layer: L.Layer) => {
                deletedIds.push(L.stamp(layer));
              });

              onDrawnItemsChange(
                drawnItems.filter((item) => !deletedIds.includes(item.id)),
              );
            }}
            draw={{
              polyline: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>

        {propertiesWithCoordinates.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat, property.lng]}
            icon={createPinMarker()}
          >
            <Popup>
              <div className="min-w-[220px] p-2">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="mb-3 h-24 w-full rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="mb-1 font-bold text-black">
                  QAR {formatPrice(property.price)}
                </div>
                <div className="mb-2 text-[10px] font-bold tracking-widest text-accent uppercase">
                  {property.type} • {property.beds} Beds
                </div>
                <button
                  type="button"
                  onClick={() => onViewProperty(property.id)}
                  className="w-full rounded bg-accent-dark py-2 text-[9px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-accent"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {drawnItems.length > 0 ? (
        <button
          type="button"
          onClick={clearDrawFilters}
          className="absolute top-4 left-4 z-[1000] flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-[9px] font-bold tracking-widest text-black uppercase shadow-xl transition-all hover:bg-accent hover:text-white"
        >
          <X className="h-3 w-3" />
          Clear Map Filter
        </button>
      ) : null}
    </div>
  );
}
