import { AggregationWorkerActions } from "@/features/activity-aggregation/types/aggregation";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { AggregationCategory } from "@/types/activity-aggregation";

import { ApiType } from "@/lib/auth/api-types";
import { RemoteProxy } from "@/utils/worker-store-template";

export async function dispatchActivityAggregation(
  originType: ApiType,
  selectionOptions: ActivityAggregationSelector,
  workerPool: RemoteProxy<AggregationWorkerActions>[],
): Promise<void> {
  if (workerPool.length === 0) {
    throw new Error("Aggregate Worker pool empty");
  }

  await Promise.all(
    Object.values(AggregationCategory).map((taskType, index) =>
      workerPool[index % workerPool.length].processWorkerTask(
        taskType,
        originType,
        selectionOptions,
      ),
    ),
  );
}
