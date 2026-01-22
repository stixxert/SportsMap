"use client";

import { SpatialDataIndex } from "@/features/activity-aggregation";
import { BBox } from "rbush";
import {
  getZoomDistanceSensitivity,
  lineSegmentToLatLng,
} from "@/features/maps/utils/bounds";
import { getClosestPointOnLine, pointDistanceTo } from "@/utils/geo";
import { ActivityId } from "@/features/maps/types/types";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { ACTIVITY_STORE, INDEXES } from "@/features/activity/lib/data/schema";
import { ApiType } from "@/types/configuration-types";
import { SummaryActivity } from "@/strava-api";
import { Point } from "@/types/types";

export interface AgnosticInteractionSearch {
  point?: Point;
  bounds: BBox | BBox[];
  zoomLevel?: number;
}

export function getIndexBboxResults(
  index: SpatialDataIndex,
  bBox: BBox | BBox[],
) {
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
  view: AgnosticInteractionSearch,
): ActivityId[] {
  /* TODO: Represent points separated by enough time as another activity pass. Needs stream fetching to implement*/

  const { point, bounds, zoomLevel } = view;

  if (!(point && bounds && zoomLevel)) return [];

  const results = getIndexBboxResults(index, bounds);

  const activityIds: ActivityId[] = [];

  results.forEach((line) => {
    if (!activityIds.find((id) => id === line.data)) {
      const lineClosestPoint = getClosestPointOnLine(
        lineSegmentToLatLng(line),
        point,
      );

      const distance = pointDistanceTo(point, lineClosestPoint);

      if (distance <= getZoomDistanceSensitivity(zoomLevel || 2)) {
        activityIds.push(line.data);
      }
    }
  });

  return activityIds;
}

export async function getViewActivitiesImpl(
  originType: ApiType,
  index: SpatialDataIndex,
  view: AgnosticInteractionSearch,
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
    activityIds.map((id) => db.getFromIndex(ACTIVITY_STORE, INDEXES.ID, id)),
  ).then((result) => result.filter((val) => val !== undefined));
}
