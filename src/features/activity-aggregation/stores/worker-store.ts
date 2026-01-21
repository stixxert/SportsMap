"use client";

import * as zustand from "zustand";

interface WorkerState {
  workers: Worker[];
}

interface WorkerActions {
  setWorkers: (workers: Worker[]) => void;
}

type WorkerStore = WorkerState & WorkerActions;

export const useWorkerStore = zustand.create<WorkerStore>((set) => ({
  workers: [],
  setWorkers: (workers: Worker[]) =>
    set({
      workers,
    }),
}));
