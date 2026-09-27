'use client';

import { TileLayer } from "react-leaflet";

const DEFAULT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

const DEFAULT_TILE_ATTRIBUTION = "";

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim() || DEFAULT_TILE_URL;

const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION?.trim() || DEFAULT_TILE_ATTRIBUTION;

export function ColorTileLayer() {
  return (
    <TileLayer
      className="rise-map-tiles"
      attribution={TILE_ATTRIBUTION}
      url={TILE_URL}
      updateWhenIdle
      keepBuffer={4}
    />
  );
}
