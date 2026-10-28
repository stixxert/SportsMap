import { Activity } from "@/lib/strava/types";
import { decode } from "@googlemaps/polyline-codec";
import { DataIndexObject } from "@/types/activity-aggregation";
import { Point } from "@/types/geo";

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

export function breakdownActivity(activity: Activity): Point[] {
  return decode(activity.map?.summaryPolyline || "");
}

export function getActivityMapLatLngBounds(activity: Activity) {
  const pts = breakdownActivity(activity);

  // A trainer/manual activity has no polyline. Returning [[0,0],[0,0]] would send
  // the map to Null Island; undefined lets the caller simply not move the view.
  if (pts.length === 0) return undefined;

  // Explicit loop: `Math.min(...lats)` overflows the call stack for long activities
  // (a spread of ~65k+ elements throws RangeError), and this allocates nothing.
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of pts) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const se = [minLat, maxLng] as Point;
  const nw = [maxLat, minLng] as Point;

  return [se, nw];
}
