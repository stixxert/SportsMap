"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMapPointClickUpdate,
  createMapViewUpdate,
  setActivityAsMapBounds,
} from "@/features/maps/lib/map-view";
import { subscribeToPointInteractionUpdate } from "@/features/maps/lib/map-visuals";
import { useMap } from "@/features/maps/stores/map-store";
import {
  ActivityInteractionViewState,
  useActivityInteractionViewStore,
} from "@/features/maps/stores/activity-interaction-view-store";
import { SummaryActivity } from "@/src/generated/strava-api";
import {
  createActivityFeatureMap,
  createActivityVectorGrid,
  highlightActivityProps,
} from "@/features/maps/lib/activity-map-features";
import { Feature } from "geojson";
import { featuresToCollection } from "@/utils/geo";
import { ActivityId } from "@/types/activity-selection";

export function useMapInteraction() {
  const map = useMap();

  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    const pointUpdate = createMapPointClickUpdate(mapRef);
    const viewUpdate = createMapViewUpdate(mapRef);

    const unsubscribePointInteractionUpdate =
      subscribeToPointInteractionUpdate(mapRef);

    mapRef.on("click", pointUpdate);

    mapRef.on("moveend", viewUpdate);

    return () => {
      unsubscribePointInteractionUpdate();

      if (!mapRef) return;

      mapRef.off("moveend", viewUpdate);

      mapRef.off("click", pointUpdate);
    };
  }, [map]);
}

type ActivityGetterFn = (activityId: ActivityId) => SummaryActivity | undefined;

function useActivityGetter(
  activityView: ActivityInteractionViewState["activityView"],
): ActivityGetterFn {
  return useCallback(
    (activityId: ActivityId) => {
      if (!activityView) return undefined;

      return activityView.find((activity) => activity.id === activityId);
    },
    [activityView],
  );
}

function useHighlightInteraction() {
  const [highlightedActivities, _setHighlightedActivities] = useState<
    Feature[]
  >([]);

  const map = useMap();

  const activityHasHighlight = (activityId: ActivityId) => {
    return Boolean(
      highlightedActivities.find((activity) => activity.id === activityId),
    );
  };

  const removeActivityHighlight = (activityId: ActivityId) => {
    _setHighlightedActivities((prevState) =>
      prevState.filter((feature) => feature.id !== activityId),
    );
  };

  const addActivity = (activity: SummaryActivity) => {
    const map = createActivityFeatureMap(activity);

    if (!map) return;

    _setHighlightedActivities((prevState) => [...prevState, map]);
  };

  useEffect(() => {
    if (!map.current) return;

    if (!highlightedActivities.length) return;

    const collection = featuresToCollection(highlightedActivities);

    const highlightLayer = createActivityVectorGrid(
      map.current,
      collection,
      highlightActivityProps,
    );

    return () => {
      if (!highlightLayer) return;

      highlightLayer.remove();
    };
  }, [highlightedActivities, map]);

  const toggleActivityHighlight = (activity: SummaryActivity) => {
    if (!map.current) return;

    if (activityHasHighlight(activity.id ?? 0))
      return removeActivityHighlight(activity.id ?? 0);

    addActivity(activity);
  };

  return {
    activityHasHighlight,
    toggleActivityHighlight,
    removeActivityHighlight,
  };
}

function useActivitySelectionInteraction() {
  const map = useMap();

  return (activity: SummaryActivity) => {
    if (!map.current) return;

    setActivityAsMapBounds(map.current, activity);
  };
}

export function useMapActivityInteraction() {
  const focusActivity = useRef<ActivityId | null>(null);

  const fitMapBoundsToActivity = useActivitySelectionInteraction();

  const {
    activityHasHighlight,
    toggleActivityHighlight,
    removeActivityHighlight,
  } = useHighlightInteraction();

  const activityView = useActivityInteractionViewStore(
    (state) => state.activityView,
  );

  const getActivity = useActivityGetter(activityView);

  const addHighlightedActivity = (activityId: ActivityId) => {
    if (!activityView) return;

    if (activityHasHighlight(activityId)) return;

    const activity = getActivity(activityId);

    if (!activity) return;

    toggleActivityHighlight(activity);
  };

  const removeHighlightedActivity = (activityId: ActivityId) => {
    if (!activityView) return;

    if (!activityHasHighlight(activityId)) return;

    removeActivityHighlight(activityId);
  };

  const toggleActivityInFocus = (activityId: ActivityId | null) => {
    if (!activityId) return;

    if (!activityView) return;

    const activity = getActivity(activityId);

    if (!activity) return;

    fitMapBoundsToActivity(activity);

    focusActivity.current = activityId;
  };

  return {
    addHighlightedActivity,
    removeHighlightedActivity,
    toggleActivityInFocus,
  };
}
