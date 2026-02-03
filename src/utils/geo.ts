"use client";

import { Feature, FeatureCollection, Position } from "geojson";
import { Point } from "@/types/geo";

/* https://stackoverflow.com/a/6853926 */
export function getClosestPointOnLine(linePoints: Point[], queryPoint: Point) {
  const A = queryPoint[0] - linePoints[0][0];
  const B = queryPoint[1] - linePoints[0][1];
  const C = linePoints[1][0] - linePoints[0][0];
  const D = linePoints[1][1] - linePoints[0][1];

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  let closestPoint: Point;

  if (param < 0) {
    closestPoint = linePoints[0];
  } else if (param > 1) {
    closestPoint = linePoints[1];
  } else {
    closestPoint = [linePoints[0][0] + param * C, linePoints[0][1] + param * D];
  }

  return closestPoint;
}

export function pointDistanceTo(a: Point, b: Point) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];

  return Math.sqrt(dx * dx + dy * dy);
}

export const M_PER_DEG_LNG_EQ = 113200;
export const M_PER_DEG_LAT = 111000;

export function mapPointsToFeature(
  points: Point[],
  id: number,
): Feature | undefined {
  if (!points.length) return undefined;

  return {
    id: id,
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: points.map((pt) => [pt[1], pt[0]] as Position),
    },
    properties: {},
  };
}

export function featuresToCollection(features: Feature[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features,
  };
}
