'use client';

import { TileLayer } from "react-leaflet";

const COLOR_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const COLOR_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function ColorTileLayer() {
  return (
    <TileLayer
      attribution={COLOR_TILE_ATTRIBUTION}
      url={COLOR_TILE_URL}
      updateWhenIdle
      keepBuffer={4}
    />
  );
}
