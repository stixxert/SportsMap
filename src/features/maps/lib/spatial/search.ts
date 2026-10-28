"use client";

import { BBox } from "rbush";
import { lineSegmentToLatLng } from "@/features/maps/utils/point";
import { getClosestPointOnLine } from "@/utils/geo";
import { openActivityDatabase } from "@/lib/activity/db";
import { Activity } from "@/lib/strava/types";
import haversine from "haversine-distance";
import {
  ACTIVITY_INDEXES,
  ACTIVITY_STORES,
} from "@/lib/activity/activity-schema";
import { ActivityId } from "@/types/activity-selection";
import { ApiType } from "@/lib/auth/api-types";
import {
  SpatialDataIndex,
  SpatialDataObject,
} from "@/lib/activity-aggregation/spatial-index";
import { Point } from "@/types/geo";

export interface InteractionSearch {
  point?: Point;
  bounds: BBox | BBox[];
  radius?: number;
}

export function getIndexBboxResults(
  index: SpatialDataIndex,
  bBox: BBox | BBox[],
): SpatialDataObject[] {
  if (Array.isArray(bBox)) return bBox.map((b) => index.search(b)).flat();

  return index.search(bBox);
}

export function getActivitiesOfBBox(
  index: SpatialDataIndex,
  bBox: BBox | BBox[],
): ActivityId[] {
  const results = getIndexBboxResults(index, bBox);

  // A Set keeps this linear: an R-tree bbox result can contain thousands of segments
  // belonging to the same activity, and Array.find made this quadratic.
  const activityIds = new Set<ActivityId>();

  for (const line of results) activityIds.add(line.data);

  return [...activityIds];
}

export function getActivitiesOfPoint(
  index: SpatialDataIndex,
  view: InteractionSearch,
): ActivityId[] {
  const { point, bounds, radius } = view;

  if (!(point && bounds && radius)) return [];

  const results = getIndexBboxResults(index, bounds);

  const activityIds = new Set<ActivityId>();

  for (const line of results) {
    if (activityIds.has(line.data)) continue;

    const lineClosestPoint = getClosestPointOnLine(
      lineSegmentToLatLng(line),
      point,
    );
    const distance = haversine(
      { lat: point[0], lng: point[1] },
      { lat: lineClosestPoint[0], lng: lineClosestPoint[1] },
    );
    if (distance <= radius) {
      activityIds.add(line.data);
    }
  }

  return [...activityIds];
}

export async function getViewActivitiesImpl(
  originType: ApiType,
  index: SpatialDataIndex,
  view: InteractionSearch,
): Promise<Activity[]> {
  let activityIds: ActivityId[];

  const { point, bounds } = view;

  if (!bounds) return [];

  if (point === undefined) {
    activityIds = getActivitiesOfBBox(index, bounds);
  } else {
    activityIds = getActivitiesOfPoint(index, view);
  }

  const db = await openActivityDatabase(originType);

  return await Promise.all(
    activityIds.map((id) =>
      db.getFromIndex(ACTIVITY_STORES.Activity, ACTIVITY_INDEXES.ID, id),
    ),
  ).then((result) => result.filter((val) => val !== undefined));
}
