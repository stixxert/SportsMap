"use client";

import {
  LatLng,
  LatLngBounds,
  LatLngTuple,
  LeafletMouseEvent,
  Map,
} from "leaflet";
import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import {
  PointInteraction,
  useMapInteractionStore,
  usePointSensitivityStore,
} from "@/features/maps/stores/map-interaction-store";
import { SummaryActivity } from "@/src/generated/strava-api";
import {
  convLatLngToPoint,
  getBoundsSearchBox,
  getPointBounds,
} from "@/features/maps/utils/latlng-bounds";
import { getViewActivities } from "@/features/maps/lib/spatial/dispatch-worker";
import { getActivityMapLatLngBounds } from "@/lib/activity-map-breakdown";
import { calculatePointRadius } from "@/features/maps/utils/point";

export function getZoomDistanceSensitivity(zoomLevel: number) {
  return calculatePointRadius(
    usePointSensitivityStore.getState().pointSensitivity,
    zoomLevel,
  );
}

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
      radius: getZoomDistanceSensitivity(zoomLevel),
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

export function setActivityAsMapBounds(map: Map, activity: SummaryActivity) {
  const bounds = getActivityMapLatLngBounds(activity) as LatLngTuple[];

  map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
}
