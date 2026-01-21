import { useWorkerStore } from "@/features/activity-aggregation/stores/worker-store";
import { dispatchActivityAggregation } from "@/features/activity-aggregation/lib/dispatch-aggregate";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import { ApiType } from "@/types/configuration-types";
import { useCallback } from "react";

export function useAggregateDispatcher() {
  const workers = useWorkerStore((state) => state.workers);

  return useCallback(
    (originType: ApiType, selectionOptions: ActivityAggregationSelector) =>
      dispatchActivityAggregation(originType, selectionOptions, workers),
    [workers],
  );
}
