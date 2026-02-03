import { MIN_LOWER_BOUNDS } from "@/utils/db";

import { ApiType } from "@/lib/auth/api-types";
import { ActivityAggregationSelector } from "@/types/activity-selection";

export interface MapIndexWorkerUpdate {
  originType: ApiType;
  selector: ActivityAggregationSelector;
}

export interface MapIndexWorkerState {
  indexObservationState: MapIndexWorkerUpdate;
}

export const defaultMapIndexWorkerState: MapIndexWorkerState = {
  indexObservationState: {
    originType: ApiType.Demo,
    selector: {
      startDate: MIN_LOWER_BOUNDS.date,
      endDate: MIN_LOWER_BOUNDS.date,
      sportType: "Walk",
    },
  },
};
