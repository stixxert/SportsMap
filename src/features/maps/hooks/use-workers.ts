"use client";

import { useEffect } from "react";
import { useMapWorkerStore } from "@/features/maps/stores/worker-store";
import { SPATIAL_SEARCH_WORKER } from "@/features/maps/lib/spatial/worker-actions";
import { setSpatialSearchWorker } from "@/features/maps/lib/spatial/dispatch-worker";

const SPATIAL_SEARCH_WORKER_URL = "../lib/spatial/worker.ts";

export function useMapWorkers() {
  useEffect(() => {
    const workers: { [key: string]: Worker } = {
      [SPATIAL_SEARCH_WORKER]: new Worker(
        new URL(SPATIAL_SEARCH_WORKER_URL, import.meta.url),
      ),
    };

    useMapWorkerStore.getState().setWorkers(workers);

    setSpatialSearchWorker(workers[SPATIAL_SEARCH_WORKER]);

    return () => {
      Object.values(workers).forEach((worker) => worker.terminate());
    };
  }, []);
}
