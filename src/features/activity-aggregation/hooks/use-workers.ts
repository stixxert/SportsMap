"use client";

import * as Comlink from "comlink";

import { useEffect } from "react";
import { useWorkerStore } from "@/features/activity-aggregation/stores/worker-store";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";
import { AggregationWorkerActions } from "@/features/activity-aggregation/types/aggregation";

export const AGGREGATE_WORKER_COUNT = Object.keys(aggregationHandlers).length;

const WORKER_URL = "../lib/task-worker.ts";

export function useAggregateWorkers() {
  useEffect(() => {
    const workers = Array.from({ length: AGGREGATE_WORKER_COUNT }).map(
      () => new Worker(new URL(WORKER_URL, import.meta.url)),
    );

    const proxyWorkers = workers.map((worker) =>
      Comlink.wrap<AggregationWorkerActions>(worker),
    );

    useWorkerStore.getState().setWorkers(proxyWorkers);

    return () => {
      workers.forEach((worker) => worker.terminate());
    };
  }, []);
}
