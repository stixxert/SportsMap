"use client";

import { Map, LatLng, LeafletMouseEvent, LatLngBounds } from "leaflet";
import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import {
  PointInteraction,
  useMapInteractionStore,
} from "@/features/maps/stores/map-interaction-store";
import { getZoomDistanceSensitivity } from "@/features/maps/utils/bounds";
import { SummaryActivity } from "@/strava-api";
import {
  convLatLngToPoint,
  getBoundsSearchBox,
  getPointBounds,
} from "@/features/maps/utils/latlng-bounds";
import { getViewActivities } from "@/features/maps/lib/spatial/dispatch-worker";

export async function updateActivitiesInViewCallback() {
  const { interaction, value } = useMapInteractionStore.getState();

  if (!(interaction && value)) return;

  let activities: SummaryActivity[];

  if (interaction === "mapview") {
    const bounds = getBoundsSearchBox(value as LatLngBounds);

    activities = await getViewActivities({ bounds });
  } else if (interaction === "point") {
    const pointInteraction = value as PointInteraction;

    const { point, zoomLevel } = pointInteraction;

    const bounds = getBoundsSearchBox(getPointBounds(point, zoomLevel));

    activities = await getViewActivities({
      point: convLatLngToPoint(point),
      bounds,
      zoomLevel,
    });
  } else {
    activities = [];
  }

  useActivityInteractionViewStore.getState().setActivityView(activities);
}

export function setMapBoundsAsView(map: Map, forceUpdate?: boolean) {
  if (useMapInteractionStore.getState().interaction === "point" && !forceUpdate)
    return;

  const bounds = map.getBounds();

  useMapInteractionStore.getState().setInteractionState({
    interaction: "mapview",
    value: bounds,
  });
}

export function setPointAsView(map: Map, point: LatLng) {
  const zoomLevel = map.getZoom();

  const distance = getZoomDistanceSensitivity(zoomLevel) * 2;

  useMapInteractionStore.getState().setPointInteraction({
    point,
    zoomLevel,
  });
}

export function createMapViewUpdate(map: Map) {
  return () => setMapBoundsAsView(map);
}

export function createMapPointClickUpdate(map: Map) {
  return (event: LeafletMouseEvent) => setPointAsView(map, event.latlng);
}
