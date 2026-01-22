import { useWorkerStore } from "@/features/activity-aggregation/stores/worker-store";
import { useEffect } from "react";

export const AGGREGATE_WORKER_COUNT = 2;

const WORKER_URL = "../lib/task-worker.ts";

export function useAggregateWorkers() {
  const setWorkers = useWorkerStore((state) => state.setWorkers);

  useEffect(() => {
    const workers = Array.from({ length: AGGREGATE_WORKER_COUNT }).map(
      () => new Worker(new URL(WORKER_URL, import.meta.url)),
    );

    setWorkers(workers);

    return () => {
      workers.forEach((worker) => worker.terminate());
    };
  }, []);
}
