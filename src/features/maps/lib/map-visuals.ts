"use client";

import L, { LatLng, LocationEvent } from "leaflet";
import { getZoomDistanceSensitivity } from "@/features/maps/utils/bounds";
import {
  PointInteraction,
  useMapInteractionStore,
  usePointSensitivityStore,
} from "@/features/maps/stores/map-interaction-store";

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

function getPointRadius(zoomLevel: number) {
  return getZoomDistanceSensitivity(zoomLevel) / 10;
}

function getCircleRadius(zoomLevel: number) {
  return getZoomDistanceSensitivity(zoomLevel);
}

function getPointOptions(zoomLevel: number): L.CircleOptions {
  return {
    ...POINT,
    radius: getPointRadius(zoomLevel),
  };
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

export function subscribeToPointInteractionUpdate(map: L.Map) {
  let layerGroup: L.LayerGroup | null = null;

  function fn() {
    const interaction = useMapInteractionStore.getState().interaction;
    const value = useMapInteractionStore.getState().value;
    if (interaction !== "point") {
      if (layerGroup) {
        map.removeLayer(layerGroup);
        layerGroup = null;
      }
      return;
    }

    if (layerGroup) {
      map.removeLayer(layerGroup);
      layerGroup = null;
    }

    if (!value) return;

    const pointValue = (value as PointInteraction).point;

    layerGroup = drawSelectionPoint(map, pointValue);
  }

  const unsubPointInteraction = useMapInteractionStore.subscribe(() => fn());

  const unsubPointSensitivity = usePointSensitivityStore.subscribe(() => fn());

  return () => {
    unsubPointSensitivity();
    unsubPointInteraction();
  };
}
