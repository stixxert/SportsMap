import { IndexType } from "@/features/maps/lib/geospatial-index";
import L, { LatLng, LatLngBounds, LeafletMouseEvent } from "leaflet";
import { BBox } from "rbush";
import {
  latLngDistanceToMeters,
  metersDistanceToLatLng,
  pointDistanceToLine,
} from "@/utils/geo";
import { SummaryActivity } from "@/strava-api";
import { useGeospatialIndexStore } from "@/features/maps/stores/geospatial-store";
import { useActivityInteractionViewStore } from "@/features/maps/stores/activity-interaction-view-store";
import { useMapInteractionStore } from "@/features/maps/stores/map-interaction-store";

const POINT_SEARCH_SENSITIVITY = 2; // meters

function lineSegmentToLatLng<T extends BBox>(lineSegment: T): number[][] {
  return [
    [lineSegment.minX, lineSegment.minY],
    [lineSegment.maxX, lineSegment.maxY],
  ];
}

export function getPointSearchBox(point: LatLng) {
  const distance = metersDistanceToLatLng(point.lat, POINT_SEARCH_SENSITIVITY);
  return {
    minX: point.lat - distance[0],
    minY: point.lng - distance[1],
    maxX: point.lat + distance[0],
    maxY: point.lng + distance[1],
  } as BBox;
}

export function getBoundsSearchBox(bounds: LatLngBounds): BBox | BBox[] {
  function getWidth(west: number, east: number): number {
    const _east = east < west ? east + 360 : east;

    return _east - west;
  }

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const south = sw.lat;
  const north = ne.lat;

  /* if viewport covers more than one rotation around the globe, clamp to one rotation */
  if (getWidth(sw.lng, ne.lng) >= 360 - 0.01)
    return { minX: south, minY: -180, maxX: north, maxY: 180 };

  const wrapWest = sw.wrap().lng;
  const wrapEast = ne.wrap().lng;

  /* no antimeridian crossing */
  if (wrapWest < wrapEast)
    return { minX: south, minY: wrapWest, maxX: north, maxY: wrapEast };

  /* crosses the antimeridian: split into two boxes */
  return [
    { minX: south, minY: wrapWest, maxX: north, maxY: 180 },
    { minX: south, minY: -180, maxX: north, maxY: wrapEast },
  ];
}

export function getActivitiesOfBBox(
  index: IndexType,
  activityView: SummaryActivity[],
  bBox: BBox | BBox[],
) {
  const results = Array.isArray(bBox)
    ? bBox.map((b) => index.search(b)).flat()
    : index.search(bBox);

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
) {
  /* TODO: Represent points separated by enough time as another activity pass. Needs stream fetching to implement*/
  const searchBox = getPointSearchBox(point);

  const results = index.search(searchBox);

  const activities: SummaryActivity[] = [];
  const ids: number[] = [];

  results.forEach((line) => {
    if (!ids.find((id) => id === line.id)) {
      const activity = activityView[line.id];

      if (activities.find((_activity) => _activity.id === activity.id)) return;

      const distanceLatLng = pointDistanceToLine(lineSegmentToLatLng(line), [
        point.lat,
        point.lng,
      ]);

      const distanceMeters = latLngDistanceToMeters(point.lat, distanceLatLng);

      if (distanceMeters <= POINT_SEARCH_SENSITIVITY) {
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
    activities = getActivitiesOfPoint(
      index,
      activityView,
      interactionValue as LatLng,
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

export function createMapViewUpdate(map: L.Map) {
  return () => {
    setMapBoundsAsView(map);
  };
}

export function createMapPointClickUpdate() {
  return (event: LeafletMouseEvent) => {
    useMapInteractionStore
      .getState()
      .setInteractionState({ interaction: "point", value: event.latlng });
  };
}
