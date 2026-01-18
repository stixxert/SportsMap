"use client";

import { SummaryActivity } from "@/strava-api";
import * as zustand from "zustand";
import { AvailabilityStore, createAvailabilityStore } from "@/utils/store";
import { ActivitySelectionOptions } from "@/features/activity/lib/data/store-actions";

interface ActivitySyncState {
  activitiesSync: boolean | null;
  setActivitiesSync: (newActivitiesSync: boolean | null) => void;
}

interface ActivityCategoryParamState {
  categoryParams: ActivitySelectionOptions;
  setCategoryParams: (categoryParams: ActivitySelectionOptions) => void;
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
    activitiesSync: null,
    setActivitiesSync: (newActivitiesSync: boolean | null) =>
      set({
        activitiesSync: newActivitiesSync,
      }),
  }),
);

export const useActivityCategoryParamStore =
  zustand.create<ActivityCategoryParamState>((set) => ({
    categoryParams: {},
    setCategoryParams: (categoryParams: ActivitySelectionOptions) =>
      set({
        categoryParams: categoryParams ? categoryParams : {},
      }),
  }));

export const useActivityStore = zustand.create<
  ActivityStore & AvailabilityStore
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
