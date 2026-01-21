import { ActivityAggregationSelector } from "@/features/activity-aggregation";
import {
  AggregationTask,
  AggregationTaskResult,
  AggregationTaskType,
} from "@/features/activity-aggregation/types/aggregation";
import { ApiType } from "@/types/configuration-types";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { performActivityAggregation } from "@/features/activity-aggregation/lib/task-aggregate";

export function constructWorkerMessageHandler(
  postMessage: typeof self.postMessage,
) {
  return async function onMessage(event: MessageEvent<AggregationTask>) {
    try {
      const { taskType, originType, selector } = event.data;

      if (!(taskType && originType && selector))
        throw new Error("Missing required properties for activity aggregation");

      const db = await openActivityDatabase(originType);

      const result = await performActivityAggregation(db, taskType, selector);

      postMessage({
        taskType,
        completed: result,
        data: undefined,
      });
    } catch (error) {
      postMessage({
        taskType: event.data.taskType,
        completed: false,
        data: (error as Error).message ?? undefined,
      });
    }
  };
}

function constructOnMessageHandler(
  resolve: (value: unknown) => void,
  reject: (reason?: unknown) => void,
) {
  return function onMessage(event: MessageEvent<AggregationTaskResult>) {
    try {
      const { completed, data } = event.data;

      if (!completed) {
        console.log(event.data);
        console.log("om err");
        return reject(data);
      }

      return resolve(undefined);
    } catch (error) {
      console.log("om err?");
      return reject(error);
    }
  };
}

function constructOnErrorHandler(reject: (reason?: unknown) => void) {
  return async function onError(error: ErrorEvent) {
    console.log("on err");
    reject(error);
  };
}

function constructTaskWorker(
  taskType: AggregationTaskType,
  originType: ApiType,
  selector: ActivityAggregationSelector,
  worker: Worker,
) {
  return new Promise((resolve, reject) => {
    worker.onmessage = constructOnMessageHandler(resolve, reject);

    worker.onerror = constructOnErrorHandler(reject);

    worker.postMessage({ taskType, originType, selector });
  });
}

export async function dispatchActivityAggregation(
  originType: ApiType,
  selectionOptions: ActivityAggregationSelector,
  workerPool: Worker[],
): Promise<void> {
  const tasks = Object.values(AggregationTask);

  if (tasks.length !== workerPool.length) {
    throw new Error("Aggregate Worker pool should match task size");
  }

  await Promise.all(
    Object.values(AggregationTask).map((taskType, index) =>
      constructTaskWorker(
        taskType,
        originType,
        selectionOptions,
        workerPool[index],
      ),
    ),
  );
}
