import * as zustand from "zustand";
import { MapIndexWorkerUpdate } from "@/features/maps/types/types";
import { ApiType } from "@/types/configuration-types";
import { MIN_LOWER_BOUNDS } from "@/utils/db";

export interface MapIndexWorkerState {
  indexObservationState: MapIndexWorkerUpdate;
}

export function createMapIndexWorkerStateStore(): MapIndexWorkerState {
  return {
    indexObservationState: {
      originType: ApiType.Demo,
      selector: {
        startDate: MIN_LOWER_BOUNDS.date,
        endDate: MIN_LOWER_BOUNDS.date,
        sportType: "Walk",
      },
    },
  };
}

export interface WorkerReadinessState {
  ready: boolean;
}

export interface WorkerReadinessActions {
  setReady: (ready: boolean) => void;
}

export type WorkerReadinessStore = WorkerReadinessState &
  WorkerReadinessActions;

export function createWorkerReadinessStateStore() {
  return zustand.create<WorkerReadinessStore>((set) => ({
    ready: false,
    setReady: (ready: boolean) => {
      set({ ready });
    },
  }));
}
