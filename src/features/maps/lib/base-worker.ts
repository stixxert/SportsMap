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
