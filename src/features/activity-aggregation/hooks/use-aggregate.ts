import { useWorkerStore } from "@/features/activity-aggregation/stores/worker-store";
import { dispatchActivityAggregation } from "@/features/activity-aggregation/lib/dispatch-aggregate";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { AggregationDispatcherFn } from "@/types/activity-aggregation";

import { ApiType } from "@/lib/auth/api-types";

export function useAggregateDispatcher(): AggregationDispatcherFn {
  const workers = useWorkerStore((state) => state.workers);

  return (originType: ApiType, selectionOptions: ActivityAggregationSelector) =>
    dispatchActivityAggregation(
      originType,
      selectionOptions,
      workers as Worker[],
    );
}
