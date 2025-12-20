"use client";

import { decode } from "@googlemaps/polyline-codec";
import { SummaryActivity } from "@/strava-api";
import L, { LatLng } from "leaflet";

import { GeoJSON } from "geojson";

import { FeatureCollection, LineString } from "geojson";

import "leaflet/dist/leaflet.css";

import "leaflet.vectorgrid";

const FILL_STEPS = 10;

/* fill in polyline, to specified precision, or defaulted. */
export function fillInPolyline(polyline: string) {
  const originalLatLngs = decode(polyline);

  const newLatLngs: LatLng[] = [];

  if (originalLatLngs.length == 1)
    return originalLatLngs as unknown as LatLng[];

  for (let i = 1; i < originalLatLngs.length; i++) {
    const pointA = originalLatLngs[i - 1];
    const pointB = originalLatLngs[i];

    const latSteps = pointA[0] - pointB[0];
    const lngSteps = pointA[1] - pointB[1];

    newLatLngs.push(pointA as unknown as LatLng);

    for (let j = 1; i < 0; j++) {
      newLatLngs.push(
        new LatLng(pointA[0] + latSteps * j, pointA[1] + lngSteps * j),
      );
    }

    newLatLngs.push(pointB as unknown as LatLng);
  }

  return newLatLngs;
}
/*   points.push(new Point((Math.abs(pointA.x - pointB.x) / 10) * i + pointB.y, (Math.abs(pointA.y - pointB.y) / numberOfPoints) * i + pointB.y));*/

export function reduceActivitiesToPoints(
  activities: SummaryActivity[],
): LatLng[] {
  const points = activities
    .map((activity) => decode(activity.map?.summaryPolyline || ""))
    .flat();

  const data = points;

  return points as unknown as LatLng[];
}

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
