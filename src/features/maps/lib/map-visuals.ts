"use client";

import L, { LatLng, LocationEvent } from "leaflet";
import {
  getZoomDistanceSensitivity,
  getZoomDistanceSensitivityNoLookup,
} from "@/features/maps/utils/bounds";
import { createLookupTable } from "@/utils/misc";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  POINT_SEARCH_SENSITIVITY,
} from "@/features/maps/config/consts";

function getCircleRadius(zoomLevel: number) {
  return getZoomDistanceSensitivity(zoomLevel);
}

const GEOLOCATION_MARKER: L.CircleOptions = {
  color: "#1769aa",
  fillColor: "#1769aa",
  opacity: 0.8,
  fillOpacity: 0.2,
};

const POINT: L.CircleOptions = {
  color: "blue",
  fillColor: "blue",
  fillOpacity: 1,
};

const POINT_CIRCLE: L.CircleOptions = {
  color: "blue",
  fillColor: "lightblue",
  fillOpacity: 0.5,
};

function _getPointRadius(zoomLevel: number) {
  return (
    getZoomDistanceSensitivityNoLookup(POINT_SEARCH_SENSITIVITY, zoomLevel) / 10
  ); //(5 * (15 - zoomLevel) ** 3) / 10;
}

export const getPointRadius = createLookupTable(
  (zoomLevel: number) => _getPointRadius(zoomLevel),
  MIN_ZOOM,
  MAX_ZOOM,
);

function getPointOptions(zoomLevel: number): L.CircleOptions {
  return { ...POINT, radius: getPointRadius(zoomLevel) };
}

function getCirclePointOptions(zoomLevel: number): L.CircleOptions {
  return { ...POINT_CIRCLE, radius: getCircleRadius(zoomLevel) };
}

export function drawSelectionPoint(map: L.Map, point: LatLng) {
  const zoomLevel = map.getZoom();

  const _point = L.circle(point, getPointOptions(zoomLevel)).bringToFront();

  const _circle = L.circle(point, getCirclePointOptions(zoomLevel));

  return L.layerGroup([_point, _circle]).addTo(map);
}

export function createSelectionPointUpdate(map: L.Map) {
  let layerGroup: L.LayerGroup | null = null;

  return (event: L.LeafletMouseEvent) => {
    if (layerGroup) map.removeLayer(layerGroup);

    layerGroup = drawSelectionPoint(map, event.latlng);
  };
}

function createGeolocationCircle(radius: number) {
  return { ...GEOLOCATION_MARKER, radius };
}

function drawGeolocationPoint(map: L.Map, point: LatLng) {
  const radiusList = [13, 14].map((radius) => getCircleRadius(radius));

  return L.layerGroup(
    radiusList.map((radius) =>
      L.circle(point, createGeolocationCircle(radius)).bringToFront(),
    ),
  ).addTo(map);
}

export function createGeolocationUpdateCallback(map: L.Map) {
  let layerGroup: L.LayerGroup | null = null;

  return (event: LocationEvent) => {
    if (layerGroup) map.removeLayer(layerGroup);

    layerGroup = drawGeolocationPoint(map, event.latlng);
  };
}
