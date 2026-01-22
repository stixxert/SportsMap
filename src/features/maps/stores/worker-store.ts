"use client";

import * as zustand from "zustand";

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
