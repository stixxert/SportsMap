import * as Comlink from "comlink";

import { ActivityAggregationSelector } from "@/features/activity-aggregation";
import {
  AggregationTask,
  AggregationWorkerActions,
} from "@/features/activity-aggregation/types/aggregation";
import { ApiType } from "@/types/configuration-types";

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
    Object.values(AggregationTask).map((taskType, index) =>
      wrappedWorkers[index % numWorkers].processWorkerTask(
        taskType,
        originType,
        selectionOptions,
      ),
    ),
  );
}
