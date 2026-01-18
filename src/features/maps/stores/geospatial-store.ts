"use client";

import * as zustand from "zustand";

import {
  bulkInsertActivities,
  createGeospatialIndex,
  IndexType,
} from "@/features/maps/lib/activity-geo-index";
import { SummaryActivity } from "@/strava-api";
import { AvailabilityStore, createAvailabilityStore } from "@/utils/store";
import { useMappableActivitiesStore } from "@/features/activity/stores/activity-store";

interface GeospatialIndexState {
  index: IndexType | null;
  activityView: SummaryActivity[] | null;
}

interface GeospatialIndexActions {
  setIndex: (index: GeospatialIndexState | null) => void;
}

type GeospatialIndexStore = GeospatialIndexState & GeospatialIndexActions;

export const useGeospatialIndexStore = zustand.create<
  GeospatialIndexStore & AvailabilityStore
>((set) => ({
  ...createAvailabilityStore(set),
  index: null,
  activityView: null,
  setIndex: (index: GeospatialIndexState | null) =>
    set({
      index: index?.index || null,
      activityView: index?.activityView || null,
    }),
}));

export function subscribeToActivityStateUpdate() {
  return useMappableActivitiesStore.subscribe((activityState) => {
    const activityView = activityState.activities;

    if (
      useGeospatialIndexStore.getState().activityView !== null &&
      activityView === useGeospatialIndexStore.getState().activityView
    ) {
      return;
    }

    useGeospatialIndexStore.getState().setIndex(null);

    const index = createGeospatialIndex();

    bulkInsertActivities(index, activityView);

    useGeospatialIndexStore
      .getState()
      .setIndex({ index, activityView: activityView });
  });
}
