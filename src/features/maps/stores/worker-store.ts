"use client";

import * as zustand from "zustand";
import { useFilterAggregationProcessingStore } from "@/features/activity-filter/stores/active-filter-store";
import { updateIndexWithMarshalling } from "@/features/maps/lib/heatmap/dispatch-worker";
import { useApiTypeStore } from "@/features/auth/stores/api-store";

interface MapWorkerState {
  workers: { [key: string]: Worker };
}

interface MapWorkerActions {
  setWorkers: (workers: { [key: string]: Worker }) => void;
}

type MapWorkerStore = MapWorkerState & MapWorkerActions;

export const useMapWorkerStore = zustand.create<MapWorkerStore>((set) => ({
  workers: {},
  setWorkers: (workers: { [key: string]: Worker }) =>
    set({
      workers,
    }),
}));

useFilterAggregationProcessingStore.subscribe(() =>
  updateIndexWithMarshalling(),
);
useApiTypeStore.subscribe(() => updateIndexWithMarshalling());
