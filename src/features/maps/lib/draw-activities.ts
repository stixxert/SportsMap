"use client";

import { decode } from "@googlemaps/polyline-codec";
import { SummaryActivity } from "@/strava-api";
import L, { PathOptions } from "leaflet";

import { Feature, FeatureCollection, Position } from "geojson";

import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";
import { ZOOM_BOUNDS } from "@/config/map";

export function createActivityFeatureMap(
  activity: SummaryActivity,
): Feature | undefined {
  const points = decode(activity.map?.summaryPolyline || "");

  if (!points.length) return undefined;

  return {
    id: activity.id,
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: points.map((pt) => [pt[1], pt[0]] as Position),
    },
    properties: {},
  };
}

export function activityToGeoJSON(
  activity: SummaryActivity,
): FeatureCollection | undefined {
  const map = createActivityFeatureMap(activity);

  if (!map) return undefined;

  return {
    type: "FeatureCollection",
    features: [map],
  };
}

export function activitiesToGeoJSON(
  activities: SummaryActivity[],
): FeatureCollection | undefined {
  const maps = activities
    .map((activity) => createActivityFeatureMap(activity))
    .filter((map) => map !== undefined);

  if (!maps.length) return undefined;

  return {
    type: "FeatureCollection",
    features: maps,
  };
}

export function featuresToCollection(features: Feature[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

export const allActivityProps: PathOptions = {
  fillColor: "#FF0000",
  color: "blue",
  weight: 1,
  fillOpacity: 0.7,
};

export const highlightActivityProps: PathOptions = {
  fillColor: '"#FF0000',
  color: "red",
  weight: 2.5,
  fillOpacity: 0.5,
};

export function createActivityVectorGrid(
  map: L.Map,
  data: FeatureCollection | undefined,
  props: PathOptions = allActivityProps,
): L.VectorGrid | undefined {
  if (!data) return undefined;
  return L.vectorGrid
    .slicer(data, {
      maxZoom: ZOOM_BOUNDS.max,
      vectorTileLayerStyles: {
        sliced: props,
      },
    })
    .addTo(map);
}
