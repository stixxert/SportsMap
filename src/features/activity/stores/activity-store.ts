"use client";

import { SummaryActivity } from "@/strava-api";
import { ActivitiesCategoryParams } from "@/types/types";
import * as zustand from "zustand";
import { createAvailabilityStore, StoreAvailabilityStore } from "@/utils/store";

interface ActivitySyncState {
  activitiesSync: boolean;
  setActivitiesSync: (newActivitiesSync: boolean) => void;
}

interface ActivityCategoryParamState {
  categoryParams: ActivitiesCategoryParams;
  setCategoryParams: (categoryParams: ActivitiesCategoryParams) => void;
}

interface ActivityState {
  activities: SummaryActivity[];
}

interface ActivityActions {
  setActivities: (activities: SummaryActivity[]) => void;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivitySyncStore = zustand.create<ActivitySyncState>(
  (set) => ({
    activitiesSync: false,
    setActivitiesSync: (newActivitiesSync: boolean) =>
      set({
        activitiesSync: newActivitiesSync,
      }),
  }),
);

export const useActivityCategoryParamStore =
  zustand.create<ActivityCategoryParamState>((set) => ({
    categoryParams: {},
    setCategoryParams: (categoryParams: ActivitiesCategoryParams) =>
      set({
        categoryParams: categoryParams ? categoryParams : {},
      }),
  }));

export const useActivityStore = zustand.create<
  ActivityStore & StoreAvailabilityStore
>((set) => ({
  ...createAvailabilityStore(set),
  activities: [],
  setActivities: (activities: SummaryActivity[]) => {
    set({ activities: activities });
  },
}));

export const useMappableActivitiesStore = zustand.create<ActivityStore>(
  (set) => ({
    activities: [],
    setActivities: (activities: SummaryActivity[]) => {
      set({ activities: activities });
    },
  }),
);

useActivityStore.subscribe((state) => {
  const activities = state.activities;

  const mappableActivities = activities.filter((activity) => {
    if (
      activity.map?.summaryPolyline ||
      (activity.map?.summaryPolyline?.length || 0) > 0
    )
      return true;

    return !!activity.distance;
  });
  useMappableActivitiesStore.getState().setActivities(mappableActivities);
});

export const useCurrentActivities = () =>
  useActivityStore((state) => state.activities);
