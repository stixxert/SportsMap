"use client";

import * as zustand from "zustand";

import { SpatialDataIndex } from "@/features/activity-aggregation/spatial-index/types";

interface SpatialIndexState {
  index: SpatialDataIndex | null;
}

interface SpatialIndexActions {
  setIndex: (index: SpatialDataIndex | null) => void;
}

type SpatialIndexStore = SpatialIndexState & SpatialIndexActions;

export function createSpatialIndexStore() {
  return zustand.create<SpatialIndexStore>((set) => ({
    index: null,
    setIndex: (index: SpatialDataIndex | null) =>
      set({
        index: index,
      }),
  }));
}
