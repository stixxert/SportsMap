"use client";

import * as zustand from "zustand";

interface ActivitySyncState {
  /** null = not attempted yet, false = in flight or failed, true = done. */
  activitiesSync: boolean | null;
  setActivitiesSync: (newActivitiesSync: boolean | null) => void;
  /**
   * Why the last attempt failed, if it did. Kept separate from `activitiesSync` so the
   * UI can tell "still loading" apart from "gave up" and offer a retry.
   */
  syncError: string | null;
  setSyncError: (error: string | null) => void;
}

export const useActivitySyncStore = zustand.create<ActivitySyncState>((set) => ({
  activitiesSync: null,
  setActivitiesSync: (newActivitiesSync: boolean | null) =>
    set({
      activitiesSync: newActivitiesSync,
    }),
  syncError: null,
  setSyncError: (error: string | null) => set({ syncError: error }),
}));
