"use client";

import * as zustand from "zustand";

interface WorkerState {
  workers: Worker | Worker[];
}

interface WorkerActions {
  setWorkers: (workers: Worker | Worker[]) => void;
}

type WorkerStore = WorkerState & WorkerActions;

export function createWorkerStore() {
  return zustand.create<WorkerStore>((set) => ({
    workers: [],
    setWorkers: (workers: Worker | Worker[]) =>
      set({
        workers,
      }),
  }));
}
