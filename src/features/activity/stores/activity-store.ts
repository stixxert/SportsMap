"use client";

import { SummaryActivity } from "@/strava-api";
import { ActivitiesCategoryParams } from "@/src/types/types";
import * as zustand from "zustand";
import { activityDependenciesCallback } from "@features/activity/lib/activity-query";

interface ActivitySyncState {
  activitiesSync: boolean;
  setActivitiesSync: (newActivitiesSync: boolean) => void;
}

interface ActivityCategoryParamState {
  categoryParams: ActivitiesCategoryParams;
  setCategoryParams: (categoryParams: ActivitiesCategoryParams) => void;
}

interface ActivityStoreState {
  activities: Promise<SummaryActivity[]>;
  setActivities: (activities: Promise<SummaryActivity[]>) => void;
}

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

export const useActivityStore = zustand.create<ActivityStoreState>((set) => ({
  activities: Promise.resolve([]),
  setActivities: (activities: Promise<SummaryActivity[]>) => {
    set({ activities: activities });
  },
}));

export const useCurrentActivities = () =>
  useActivityStore((state) => state.activities);
