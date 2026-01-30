import { SummaryActivity } from "@/strava-api";
import { decode } from "@googlemaps/polyline-codec";
import { DataIndexObject } from "@/features/activity-aggregation";
import { Point } from "@/types/types";

export function createPolylineLineSegmentBounds<
  T = undefined,
  R = DataIndexObject<T>,
>(polyline: Point[], attributes?: { [key: string]: string | number }): R[] {
  if (polyline.length == 1) {
    const point = polyline[0];
    return createLineSegmentBounds([point, point], attributes);
  }

  const lines: R[] = [];

  for (let i = 1; i < polyline.length; i++) {
    const a = [polyline[i - 1][0], polyline[i - 1][1]] as Point;
    const b = [polyline[i][0], polyline[i][1]] as Point;
    lines.push(createLineSegmentBounds([a, b], attributes));
  }

  return lines;
}

export function createLineSegmentBounds<T = undefined, R = DataIndexObject<T>>(
  line: Point[],
  attributes?: { [key: string]: string | number },
) {
  return {
    minX: Math.min(line[0][0], line[1][0]),
    minY: Math.min(line[0][1], line[1][1]),
    maxX: Math.max(line[0][0], line[1][0]),
    maxY: Math.max(line[0][1], line[1][1]),
    ...attributes,
  } as R;
}

export function convPolylineToLineSegments(polyline: Point[]): Point[][] {
  if (polyline.length == 1) {
    const point = polyline[0];
    return [[point, point]];
  }

  const lineSegments: Point[][] = [];

  for (let i = 1; i < polyline.length; i++) {
    const a = [polyline[i - 1][0], polyline[i - 1][1]] as Point;
    const b = [polyline[i][0], polyline[i][1]] as Point;
    lineSegments.push([a, b]);
  }

  return lineSegments;
}

export function breakdownActivity(activity: SummaryActivity): Point[] {
  return decode(activity.map?.summaryPolyline || "");
}

export function getActivityMapLatLngBounds(activity: SummaryActivity) {
  const pts = breakdownActivity(activity);

  const lats = pts.map(([lat]) => lat);
  const lngs = pts.map(([, lng]) => lng);

  const minLat = Math.min(...lats);
  const minLng = Math.min(...lngs);

  const maxLat = Math.max(...lats);
  const maxLng = Math.max(...lngs);

  const se = [minLat, maxLng] as Point;
  const nw = [maxLat, minLng] as Point;

  return [se, nw];
}
