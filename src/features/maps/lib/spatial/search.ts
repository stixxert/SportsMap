"use client";

import { BBox } from "rbush";
import { lineSegmentToLatLng } from "@/features/maps/utils/point";
import { getClosestPointOnLine } from "@/utils/geo";
import { openActivityDatabase } from "@/lib/activity/db";
import { SummaryActivity } from "@/src/generated/strava-api";
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

  const activityIds: ActivityId[] = [];

  results.forEach((line) => {
    if (!activityIds.find((id) => id === line.data)) {
      activityIds.push(line.data);
    }
  });

  return activityIds;
}

export function getActivitiesOfPoint(
  index: SpatialDataIndex,
  view: InteractionSearch,
): ActivityId[] {
  const { point, bounds, radius } = view;

  if (!(point && bounds && radius)) return [];

  const results = getIndexBboxResults(index, bounds);

  const activityIds: ActivityId[] = [];

  results.forEach((line) => {
    if (!activityIds.find((id) => id === line.data)) {
      const lineClosestPoint = getClosestPointOnLine(
        lineSegmentToLatLng(line),
        point,
      );
      const distance = haversine(
        { lat: point[0], lng: point[1] },
        { lat: lineClosestPoint[0], lng: lineClosestPoint[1] },
      );
      if (distance <= radius) {
        activityIds.push(line.data);
      }
    }
  });

  return activityIds;
}

export async function getViewActivitiesImpl(
  originType: ApiType,
  index: SpatialDataIndex,
  view: InteractionSearch,
): Promise<SummaryActivity[]> {
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
