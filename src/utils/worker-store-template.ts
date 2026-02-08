"use client";

import * as Comlink from "comlink";

import * as zustand from "zustand";

export type RemoteProxy<T> = ReturnType<typeof Comlink.wrap<T>>;

interface WorkerState<T> {
  workers: RemoteProxy<T>[];
}

interface WorkerActions<T> {
  setWorkers: (workers: RemoteProxy<T>[]) => void;
}

type WorkerStore<T> = WorkerState<T> & WorkerActions<T>;

export function createWorkerStore<T>() {
  return zustand.create<WorkerStore<T>>((set) => ({
    workers: [],
    setWorkers: (workers: RemoteProxy<T>[]) =>
      set({
        workers,
      }),
  }));
}
