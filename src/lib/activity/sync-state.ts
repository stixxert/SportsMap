"use client";

import * as zustand from "zustand";

interface ActivitySyncState {
  activitiesSync: boolean | null;
  setActivitiesSync: (newActivitiesSync: boolean | null) => void;
}

export const useActivitySyncStore = zustand.create<ActivitySyncState>(
  (set) => ({
    activitiesSync: null,
    setActivitiesSync: (newActivitiesSync: boolean | null) =>
      set({
        activitiesSync: newActivitiesSync,
      }),
  }),
);
