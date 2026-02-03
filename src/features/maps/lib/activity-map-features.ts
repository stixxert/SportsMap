"use client";

import { decode } from "@googlemaps/polyline-codec";
import { SummaryActivity } from "@/strava-api";
import L, { PathOptions } from "leaflet";

import { FeatureCollection } from "geojson";

import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid";
import { ZOOM_BOUNDS } from "@/config/map";
import { featuresToCollection, mapPointsToFeature } from "@/utils/geo";

export function createActivityFeatureMap(activity: SummaryActivity) {
  const points = decode(activity.map?.summaryPolyline || "");

  return mapPointsToFeature(points, activity.id ?? 0);
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

  return featuresToCollection(maps);
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
