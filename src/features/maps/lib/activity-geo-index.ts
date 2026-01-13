import RBush, { BBox } from "rbush";
import { LatLngTuple } from "leaflet";
import { SummaryActivity } from "@/strava-api";
import { decode } from "@googlemaps/polyline-codec";

interface TaggedLineSegment extends BBox {
  id: number;
}

export type IndexType = RBush<TaggedLineSegment>;

function createLineSegmentBounds(points: LatLngTuple[], id: number) {
  return {
    minX: Math.min(points[0][0], points[1][0]),
    minY: Math.min(points[0][1], points[1][1]),
    maxX: Math.max(points[0][0], points[1][0]),
    maxY: Math.max(points[0][1], points[1][1]),
    id: id,
  } as TaggedLineSegment;
}

function reducePolylineToLineSegments(polyline: LatLngTuple[]) {
  if (polyline.length == 1) {
    const point = polyline[0];
    return [[point, point]];
  }

  const lineSegments: LatLngTuple[][] = [];

  for (let i = 1; i < polyline.length; i++) {
    const a = [polyline[i - 1][0], polyline[i - 1][1]] as LatLngTuple;
    const b = [polyline[i][0], polyline[i][1]] as LatLngTuple;
    lineSegments.push([a, b]);
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
