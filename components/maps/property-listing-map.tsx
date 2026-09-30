'use client';

import { useEffect, useMemo, useRef } from "react";
import { Bath, Bed, MapPin, X } from "lucide-react";
import {
  FeatureGroup,
  MapContainer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import {
  createGroupedMarker,
  createPriceMarker,
} from "@/components/maps/leaflet-markers";
import { ColorTileLayer } from "@/components/maps/map-tiles";
import { formatPrice } from "@/lib/property-formatting";
import { DrawnMapItem, hasValidPropertyCoordinates } from "@/lib/map-filters";
import type { Property } from "@/types/property";

const DEFAULT_CENTER: [number, number] = [25.2854, 51.531];
const QATAR_BOUNDS: [[number, number], [number, number]] = [
  [24.35, 50.65],
  [26.25, 52.05],
];
const DEFAULT_QATAR_ZOOM = 10.8;
const DEFAULT_QATAR_ZOOM_MOBILE = 9.85;

type PropertyWithCoordinates = Property & {
  lat: number;
  lng: number;
};

interface PropertyMarkerGroup {
  key: string;
  lat: number;
  lng: number;
  area: string;
  properties: PropertyWithCoordinates[];
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

function hasValidCoordinates(
  coordinates: [number, number] | null,
): coordinates is [number, number] {
  if (!coordinates) {
    return false;
  }

  return Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1]);
}

function getLocationGroupKey(property: PropertyWithCoordinates) {
  return `${property.lat.toFixed(5)}:${property.lng.toFixed(5)}`;
}

function groupPropertiesByCoordinates(
  properties: PropertyWithCoordinates[],
): PropertyMarkerGroup[] {
  const groups = new Map<string, PropertyMarkerGroup>();

  properties.forEach((property) => {
    const key = getLocationGroupKey(property);
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.properties.push(property);
      return;
    }

    groups.set(key, {
      key,
      lat: property.lat,
      lng: property.lng,
      area: property.area,
      properties: [property],
    });
  });

  return Array.from(groups.values());
}

function getAnimationConfig(isMobile: boolean, nearby: boolean) {
  return nearby
    ? {
        duration: isMobile ? 0.38 : 0.55,
        easeLinearity: 0.22,
      }
    : {
        duration: isMobile ? 0.7 : 0.95,
        easeLinearity: 0.18,
      };
}

function getDefaultQatarZoom(isMobile: boolean) {
  return isMobile ? DEFAULT_QATAR_ZOOM_MOBILE : DEFAULT_QATAR_ZOOM;
}

function applySafeMapView(
  map: L.Map,
  center: [number, number],
  zoom: number,
  options?: L.ZoomPanOptions,
) {
  try {
    const size = map.getSize();
    const hasValidSize =
      Number.isFinite(size.x) &&
      Number.isFinite(size.y) &&
      size.x > 0 &&
      size.y > 0;

    if (!hasValidSize) {
      map.setView(center, zoom, { animate: false });
      return;
    }

    map.flyTo(center, zoom, options);
  } catch {
    try {
      map.setView(center, zoom, { animate: false });
    } catch {
      // Ignore invalid transient map states during mount/resize transitions.
    }
  }
}

function MapViewportController({
  activeCenter,
  focusMode,
  properties,
  isMobile,
  isVisible,
  layoutKey,
}: {
  activeCenter: [number, number] | null;
  focusMode: "active" | "bounds";
  properties: Array<{ lat: number; lng: number; area: string }>;
  isMobile: boolean;
  isVisible: boolean;
  layoutKey: string;
}) {
  const map = useMap();
  const propertiesKey = useMemo(
    () =>
      properties
        .map((property) => `${property.area}:${property.lat}:${property.lng}`)
        .join("|"),
    [properties],
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusMode, isVisible, layoutKey, map, propertiesKey]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (focusMode !== "bounds") {
      return;
    }

    applySafeMapView(map, DEFAULT_CENTER, getDefaultQatarZoom(isMobile), {
      animate: true,
      duration: isMobile ? 0.45 : 0.75,
      easeLinearity: 0.2,
    });
  }, [focusMode, isMobile, isVisible, map, propertiesKey]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (focusMode !== "active") {
      return;
    }

    if (hasValidCoordinates(activeCenter)) {
      try {
        const target = L.latLng(activeCenter[0], activeCenter[1]);
        const currentCenter = map.getCenter();
        const targetZoom = isMobile ? 14 : 15;
        const nearby = currentCenter.distanceTo(target) < (isMobile ? 900 : 1400);
        const comfortablyVisible = map.getBounds().pad(-0.18).contains(target);

        map.stop();

        if (comfortablyVisible && Math.abs(map.getZoom() - targetZoom) <= 1) {
          map.panTo(activeCenter, {
            animate: true,
            ...getAnimationConfig(isMobile, true),
          });
          return;
        }

        applySafeMapView(map, activeCenter, targetZoom, {
          animate: true,
          ...getAnimationConfig(isMobile, nearby),
        });
      } catch {
        applySafeMapView(map, DEFAULT_CENTER, 12, { animate: false });
      }
      return;
    }

    applySafeMapView(map, DEFAULT_CENTER, getDefaultQatarZoom(isMobile), {
      animate: false,
      duration: 0,
    });
  }, [activeCenter, focusMode, isMobile, isVisible, map, properties]);

  return null;
}

interface PropertyListingMapProps {
  properties: Property[];
  activeId: number | null;
  focusMode?: "active" | "bounds";
  isVisible?: boolean;
  drawnItems: DrawnMapItem[];
  layoutKey?: string;
  onActivateProperty: (id: number) => void;
  onViewProperty: (slug: string) => void;
  onDrawnItemsChange: (items: DrawnMapItem[]) => void;
}

export function PropertyListingMap({
  properties,
  activeId,
  focusMode = "active",
  isVisible = true,
  drawnItems,
  layoutKey = "default",
  onActivateProperty,
  onViewProperty,
  onDrawnItemsChange,
}: PropertyListingMapProps) {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const markerRefs = useRef(new Map<number, L.Marker>());
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  const activeProperty = properties.find((property) => property.id === activeId);
  const activeLat = normalizeCoordinate(activeProperty?.lat);
  const activeLng = normalizeCoordinate(activeProperty?.lng);
  const activeCenter =
    activeLat !== null && activeLng !== null ? ([activeLat, activeLng] as [number, number]) : null;
  const propertiesWithCoordinates = useMemo(
    () =>
      properties.filter(hasValidPropertyCoordinates).map((property) => ({
        ...property,
        lat: normalizeCoordinate(property.lat) ?? DEFAULT_CENTER[0],
        lng: normalizeCoordinate(property.lng) ?? DEFAULT_CENTER[1],
      })),
    [properties],
  );
  const propertyGroups = useMemo(
    () => groupPropertiesByCoordinates(propertiesWithCoordinates),
    [propertiesWithCoordinates],
  );

  function syncCreatedLayer(event: {
    layerType: string;
    layer: L.Layer & {
      getLatLngs?: () => Array<Array<L.LatLng>>;
      getLatLng?: () => L.LatLng;
      getRadius?: () => number;
    };
  }) {
    const { layerType, layer } = event;
    const id = L.stamp(layer);

    if ((layerType === "polygon" || layerType === "rectangle") && layer.getLatLngs) {
      onDrawnItemsChange([
        ...drawnItems,
        {
          id,
          layerType,
          latlngs: layer.getLatLngs()?.map((group) =>
            group.map((entry) => ({ lat: entry.lat, lng: entry.lng })),
          ),
        } as DrawnMapItem,
      ]);
      return;
    }

    if (layerType === "circle" && layer.getLatLng && layer.getRadius) {
      onDrawnItemsChange([
        ...drawnItems,
        {
          id,
          layerType: "circle",
          latlng: {
            lat: layer.getLatLng().lat,
            lng: layer.getLatLng().lng,
          },
          radius: layer.getRadius(),
        },
      ]);
    }
  }

  function clearDrawFilters() {
    onDrawnItemsChange([]);
    featureGroupRef.current?.clearLayers();
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const activeMarker =
        activeId !== null ? markerRefs.current.get(activeId) : null;
      const handledMarkers = new Set<L.Marker>();

      markerRefs.current.forEach((marker) => {
        if (handledMarkers.has(marker)) {
          return;
        }

        handledMarkers.add(marker);

        if (marker === activeMarker) {
          marker.openPopup();
          return;
        }

        marker.closePopup();
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, focusMode]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={activeCenter ?? DEFAULT_CENTER}
        zoom={getDefaultQatarZoom(isMobile)}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
        attributionControl={false}
        zoomControl={false}
        preferCanvas
        fadeAnimation={!isMobile}
        zoomAnimation={!isMobile}
        markerZoomAnimation={!isMobile}
        maxBounds={QATAR_BOUNDS}
        maxBoundsViscosity={0.35}
        minZoom={isMobile ? 8.75 : 9}
        zoomSnap={0.25}
      >
        <ColorTileLayer />
        <MapViewportController
          activeCenter={activeCenter}
          focusMode={focusMode}
          properties={propertiesWithCoordinates}
          isMobile={isMobile}
          isVisible={isVisible}
          layoutKey={layoutKey}
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={syncCreatedLayer}
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

        {propertyGroups.slice(0, 50).map((group) => {
          const primaryProperty = group.properties[0];
          if (!primaryProperty) {
            return null;
          }

          const hasMultipleProperties = group.properties.length > 1;
          const isActiveGroup = group.properties.some((property) => property.id === activeId);

          return (
            <Marker
              key={group.key}
              position={[group.lat, group.lng]}
              icon={
                hasMultipleProperties
                  ? createGroupedMarker(group.properties.length, isActiveGroup, group.area)
                  : createPriceMarker(primaryProperty, isActiveGroup)
              }
              ref={(marker) => {
                if (marker) {
                  group.properties.forEach((property) => {
                    markerRefs.current.set(property.id, marker);
                  });
                  return;
                }

                group.properties.forEach((property) => {
                  markerRefs.current.delete(property.id);
                });
              }}
              eventHandlers={{
                click: (event) => {
                  onActivateProperty(primaryProperty.id);
                  event.target.openPopup();
                },
              }}
            >
              <Popup className="custom-popup" closeButton={false}>
                {hasMultipleProperties ? (
                  <div className="w-[292px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold tracking-[0.24em] text-accent uppercase">
                            {group.properties.length} Listings Here
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            <MapPin className="h-3 w-3 text-accent" />
                            {group.area}
                          </div>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                          {group.properties.length}
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[330px] overflow-y-auto p-2">
                      {group.properties.map((property) => (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => {
                            onActivateProperty(property.id);
                            onViewProperty(property.slug);
                          }}
                          className="group/item flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 line-clamp-1 text-sm font-bold text-black">
                              {property.title}
                            </div>
                            <div className="mb-1 font-display text-sm font-bold text-accent">
                              QAR {formatPrice(property.price)}
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                              <span className="flex items-center gap-1">
                                <Bed className="h-3 w-3 text-accent" />
                                {property.beds}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-3 w-3 text-accent" />
                                {property.baths}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-[240px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                    <div className="relative aspect-video">
                      <img
                        src={primaryProperty.images[0]}
                        alt={primaryProperty.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[7px] font-bold tracking-widest uppercase backdrop-blur-sm">
                        {primaryProperty.type}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-1 font-display text-lg font-bold text-black">
                        QAR {formatPrice(primaryProperty.price)}
                      </div>
                      <div className="mb-2 flex items-center gap-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                        <MapPin className="h-3 w-3 text-accent" />
                        {primaryProperty.area}
                      </div>
                      <div className="mb-4 flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase">
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3 text-accent" />
                          {primaryProperty.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3 text-accent" />
                          {primaryProperty.baths}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewProperty(primaryProperty.slug)}
                        className="w-full rounded-xl bg-black py-2.5 text-[9px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-accent"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        })}
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
