"use client";

import { decode } from "@googlemaps/polyline-codec";
import { SummaryActivity } from "@/strava-api";
import L from "leaflet";

import { FeatureCollection } from "geojson";

import "leaflet/dist/leaflet.css";

import "leaflet.vectorgrid";

export function activitytogeojson(
  activities: SummaryActivity[],
): GeoJSON.FeatureCollection {
  const featureCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  for (const activity of activities) {
    const points = decode(activity.map?.summaryPolyline || "");

    if (!points.length) continue;

    /*if (points.length <= 1) {
      featureCollection.features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [points[0][0], points[0][1]],
        },
        properties: {},
      });
    }*/

    featureCollection.features.push({
      id: activity.id,
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: points.map((pt) => [
          pt[1],
          pt[0],
        ]) as unknown as GeoJSON.Position[],
      },
      properties: {},
    });
  }

  return featureCollection;
}

export function tile(map: L.Map, data: FeatureCollection) {
  return L.vectorGrid
    .slicer(data, {
      vectorTileLayerStyles: {
        sliced: {
          fillColor: "#FF0000",
          color: "blue",
          weight: 1,
          fillOpacity: 0.7,
        },
      },
    })
    .addTo(map);
}
