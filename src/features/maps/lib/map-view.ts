"use client";

import L, { LatLng, LatLngBounds, LeafletMouseEvent } from "leaflet";
import { BBox } from "rbush";
import { getClosestPointOnLine } from "@/utils/geo";
import { SummaryActivity } from "@/strava-api";
import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import {
  PointInteraction,
  useMapInteractionStore,
} from "@/features/maps/stores/map-interaction-store";
import {
  getBoundsSearchBox,
  getPointBounds,
  getZoomDistanceSensitivity,
  lineSegmentToLatLng,
} from "@/features/maps/utils/bounds";
import { useSpatialIndexStore } from "@/features/activity-filter/stores/aggregation-stores";
import { SpatialDataIndex } from "@/features/activity-aggregation/spatial-index/types";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { ACTIVITY_STORE, INDEXES } from "@/features/activity/lib/data/schema";

type ActivityId = NonNullable<SummaryActivity["id"]>;

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
  point: LatLng,
  zoomLevel: number,
): ActivityId[] {
  /* TODO: Represent points separated by enough time as another activity pass. Needs stream fetching to implement*/
  const bBox = getBoundsSearchBox(getPointBounds(point, zoomLevel));

  const results = getIndexBboxResults(index, bBox);

  const activityIds: ActivityId[] = [];

  results.forEach((line) => {
    if (!activityIds.find((id) => id === line.data)) {
      const lineClosestPoint = getClosestPointOnLine(
        lineSegmentToLatLng(line),
        point,
      );

      const distance = point.distanceTo(lineClosestPoint);

      if (distance <= getZoomDistanceSensitivity(zoomLevel || 2)) {
        activityIds.push(line.data);
      }
    }
  });

  return activityIds;
}

export async function updateActivitiesInViewCallback() {
  const interaction = useMapInteractionStore.getState().interaction;
  const interactionValue = useMapInteractionStore.getState().value;

  const index = useSpatialIndexStore.getState().index;

  if (!index) return;

  useActivityInteractionViewStore.getState().setActivityView(null);

  let activityIds: ActivityId[];

  if (interaction === "mapview") {
    const searchBox = getBoundsSearchBox(interactionValue as LatLngBounds);

    activityIds = getActivitiesOfBBox(index, searchBox);
  } else if (interaction === "point") {
    const pointInteraction = interactionValue as PointInteraction;
    activityIds = getActivitiesOfPoint(
      index,
      pointInteraction.point,
      pointInteraction.zoomLevel,
    );
  } else {
    return;
  }

  const apiType = useApiTypeStore.getState().apiType;

  if (!apiType) return;

  const db = await openActivityDatabase(apiType);

  const activities = await Promise.all(
    activityIds.map((id) => db.getFromIndex(ACTIVITY_STORE, INDEXES.ID, id)),
  );

  useActivityInteractionViewStore.getState().setActivityView(activities);
}

export function setMapBoundsAsView(map: L.Map, forceUpdate?: boolean) {
  if (useMapInteractionStore.getState().interaction === "point" && !forceUpdate)
    return;

  const bounds = map.getBounds();

  useMapInteractionStore.getState().setInteractionState({
    interaction: "mapview",
    value: bounds,
  });
}

export function setPointAsView(map: L.Map, point: LatLng) {
  const zoomLevel = map.getZoom();

  useMapInteractionStore.getState().setPointInteraction({
    point,
    zoomLevel,
  });
}

export function createMapViewUpdate(map: L.Map) {
  return () => setMapBoundsAsView(map);
}

export function createMapPointClickUpdate(map: L.Map) {
  return (event: LeafletMouseEvent) => setPointAsView(map, event.latlng);
}
