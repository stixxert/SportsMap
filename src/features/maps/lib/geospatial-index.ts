import RBush, { BBox } from "rbush";
import { LatLng } from "leaflet";
import { SummaryActivity } from "@/strava-api";
import { decode } from "@googlemaps/polyline-codec";

interface TaggedLineSegment extends BBox {
  id: number;
}

export type IndexType = RBush<TaggedLineSegment>;

function createLineSegmentBounds(points: LatLng[], id: number) {
  return {
    minX: Math.min(points[0].lat, points[1].lat),
    minY: Math.min(points[0].lng, points[1].lng),
    maxX: Math.max(points[0].lat, points[1].lat),
    maxY: Math.max(points[0].lng, points[1].lng),
    id: id,
  } as TaggedLineSegment;
}

function reducePolylineToLineSegments(polyline: number[][]) {
  if (polyline.length == 1) {
    const point = new LatLng(polyline[0][0], polyline[0][1]);
    return [[point, point]];
  }

  const lineSegments: LatLng[][] = [];

  for (let i = 1; i < polyline.length; i++) {
    lineSegments.push([
      new LatLng(polyline[i - 1][0], polyline[i - 1][1]),
      new LatLng(polyline[i][0], polyline[i][1]),
    ]);
  }

  return lineSegments;
}

export function createGeospatialIndex(): IndexType {
  return new RBush<TaggedLineSegment>();
}

export function reduceActivities(activities: SummaryActivity[]) {
  const lineSegments: TaggedLineSegment[] = [];

  activities.forEach((activity, monotonicId) => {
    const points = decode(activity.map?.summaryPolyline || "");

    const lines = reducePolylineToLineSegments(points);

    const lineBounds = lines.map((line) =>
      createLineSegmentBounds(line, monotonicId),
    );

    lineSegments.push(...lineBounds);
  });

  return lineSegments;
}

/* Should NOT be used. does not preserve monotonic ids for mapping lines to activities */
function insertActivities(
  index: IndexType,
  activity: SummaryActivity | SummaryActivity[],
) {
  const lineSegments: TaggedLineSegment[] = [];
  if (Array.isArray(activity)) {
    lineSegments.push(...reduceActivities(activity));
  } else {
    lineSegments.push(...reduceActivities([activity]));
  }

  lineSegments.forEach((lineSegment) => index.insert(lineSegment));
}

export function bulkInsertActivities(
  index: IndexType,
  activities: SummaryActivity[],
) {
  const lineSegments = reduceActivities(activities);

  index.load(lineSegments);
}
