"use client";

import { IndexType } from "@/features/maps/lib/activity-geo-index";
import L, { LatLng, LatLngBounds, LeafletMouseEvent } from "leaflet";
import { BBox } from "rbush";
import { getClosestPointOnLine } from "@/utils/geo";
import { SummaryActivity } from "@/strava-api";
import { useGeospatialIndexStore } from "@/features/maps/stores/geospatial-store";
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

export function getIndexBboxResults(index: IndexType, bBox: BBox | BBox[]) {
  if (Array.isArray(bBox)) return bBox.map((b) => index.search(b)).flat();

  return index.search(bBox);
}

export function getActivitiesOfBBox(
  index: IndexType,
  activityView: SummaryActivity[],
  bBox: BBox | BBox[],
) {
  const results = getIndexBboxResults(index, bBox);

  const activities: SummaryActivity[] = [];
  const ids: number[] = [];

  results.forEach((line) => {
    if (!ids.find((id) => id === line.id)) {
      const activity = activityView[line.id];

      if (activities.find((_activity) => _activity.id === activity.id)) return;

      activities.push(activity);
      ids.push(line.id);
    }
  });

  return activities;
}

export function getActivitiesOfPoint(
  index: IndexType,
  activityView: SummaryActivity[],
  point: LatLng,
  zoomLevel: number,
) {
  /* TODO: Represent points separated by enough time as another activity pass. Needs stream fetching to implement*/
  const bBox = getBoundsSearchBox(getPointBounds(point, zoomLevel));

  const results = getIndexBboxResults(index, bBox);

  const activities: SummaryActivity[] = [];
  const ids: number[] = [];

  results.forEach((line) => {
    if (!ids.find((id) => id === line.id)) {
      const activity = activityView[line.id];

      if (activities.find((_activity) => _activity.id === activity.id)) return;

      const lineClosestPoint = getClosestPointOnLine(
        lineSegmentToLatLng(line),
        point,
      );

      const distance = point.distanceTo(lineClosestPoint);

      if (distance <= getZoomDistanceSensitivity(zoomLevel || 2)) {
        activities.push(activityView[line.id]);
        ids.push(line.id);
      }
    }
  });

  return activities;
}

export function updateActivitiesInViewCallback() {
  const interaction = useMapInteractionStore.getState().interaction;
  const interactionValue = useMapInteractionStore.getState().value;

  const activityView = useGeospatialIndexStore.getState().activityView;

  const index = useGeospatialIndexStore.getState().index;

  if (!index || !activityView) return;

  useActivityInteractionViewStore.getState().setActivityView(null);

  let activities: SummaryActivity[];

  if (interaction === "mapview") {
    const searchBox = getBoundsSearchBox(interactionValue as LatLngBounds);

    activities = getActivitiesOfBBox(index, activityView, searchBox);
  } else if (interaction === "point") {
    const pointInteraction = interactionValue as PointInteraction;
    activities = getActivitiesOfPoint(
      index,
      activityView,
      pointInteraction.point,
      pointInteraction.zoomLevel,
    );
  } else {
    return;
  }
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
