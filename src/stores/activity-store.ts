import * as zustand from "zustand";
import { ActivityDB } from "@lib/activity-db";

interface ActivityDBState {
  activityDB: ActivityDB | null;
  setActivityDB: (activityDB: ActivityDB | null) => void;
}

export const useActivityDBStore = zustand.create<ActivityDBState>((set) => ({
  activityDB: null,
  setActivityDB: (activityDB: ActivityDB | null) =>
    set(() => ({
      activityDB: activityDB,
    })),
}));
