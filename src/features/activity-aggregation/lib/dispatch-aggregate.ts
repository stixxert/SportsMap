import * as Comlink from "comlink";

import { AggregationWorkerActions } from "@/features/activity-aggregation/types/aggregation";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { AggregationCategory } from "@/types/activity-aggregation";

import { ApiType } from "@/lib/auth/api-types";

export async function dispatchActivityAggregation(
  originType: ApiType,
  selectionOptions: ActivityAggregationSelector,
  workerPool: Worker[],
): Promise<void> {
  const numWorkers = workerPool.length;

  if (numWorkers === 0) {
    throw new Error("Aggregate Worker pool empty");
  }

  const wrappedWorkers = workerPool.map((worker) =>
    Comlink.wrap<AggregationWorkerActions>(worker),
  );

  await Promise.all(
    Object.values(AggregationCategory).map((taskType, index) =>
      wrappedWorkers[index % numWorkers].processWorkerTask(
        taskType,
        originType,
        selectionOptions,
      ),
    ),
  );
}
