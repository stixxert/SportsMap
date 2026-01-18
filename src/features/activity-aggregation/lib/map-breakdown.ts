import { LatLngTuple } from "leaflet";
import { SummaryActivity } from "@/strava-api";
import { decode } from "@googlemaps/polyline-codec";
import {
  ActivityLineSegments,
  DataIndexObject,
  LineSegment,
} from "@/features/activity-aggregation/types/data";

export function createLineSegmentBounds<T = undefined, R = DataIndexObject<T>>(
  points: LineSegment,
  attributes?: { [key: string]: string | number },
) {
  return {
    minX: Math.min(points[0][0], points[1][0]),
    minY: Math.min(points[0][1], points[1][1]),
    maxX: Math.max(points[0][0], points[1][0]),
    maxY: Math.max(points[0][1], points[1][1]),
    ...attributes,
  } as R;
}

function convPolylineToLineSegments(
  polyline: LineSegment,
): ActivityLineSegments {
  if (polyline.length == 1) {
    const point = polyline[0];
    return [[point, point]];
  }

  const lineSegments: ActivityLineSegments = [];

  for (let i = 1; i < polyline.length; i++) {
    const a = [polyline[i - 1][0], polyline[i - 1][1]] as LatLngTuple;
    const b = [polyline[i][0], polyline[i][1]] as LatLngTuple;
    lineSegments.push([a, b]);
  }

  return lineSegments;
}

export function breakdownActivity(
  activity: SummaryActivity,
): ActivityLineSegments {
  const points = decode(activity.map?.summaryPolyline || "");

  return convPolylineToLineSegments(points);
}
