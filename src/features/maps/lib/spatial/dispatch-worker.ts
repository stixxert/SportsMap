import * as Comlink from "comlink";
import { InteractionSearch } from "@/features/maps/lib/spatial/search";
import { SummaryActivity } from "@/strava-api";
import { useApiTypeStore } from "@/lib/auth/api-store";
import {
  useActivityFilterStore,
  useFilterProcessingResults,
} from "@/lib/filter/active-filter-store";
import { spatialIndexWorkerActions } from "@/features/maps/lib/spatial/worker-actions";
import { createReadinessStore } from "@/utils/ready-state-store";
import { MapIndexWorkerUpdate } from "@/features/maps/lib/base-worker";

export type WorkerActions = typeof spatialIndexWorkerActions;

type Remote<T> = ReturnType<typeof Comlink.wrap<T>>;

const worker: { ref: Remote<WorkerActions> | undefined } = {
  ref: undefined,
};

export const useSpatialIndexReadinessStore = createReadinessStore();

export function setSpatialSearchWorker(newWorker: Worker) {
  worker.ref = Comlink.wrap(newWorker);
}

export async function getViewActivities(
  view: InteractionSearch,
): Promise<SummaryActivity[]> {
  if (!worker.ref) {
    throw new Error("Spatial search worker not initialised");
  }

  return worker.ref.getViewActivities(view);
}

export async function updateIndex(newState: MapIndexWorkerUpdate) {
  if (!worker.ref) {
    throw new Error("Spatial search worker not initialised");
  }

  return worker.ref.setIndexState(newState);
}

export async function updateIndexWithMarshalling() {
  const originType = useApiTypeStore.getState().apiType;

  if (!originType) return;

  const filterProcessingResultsReady =
    useFilterProcessingResults.getState().ready;

  if (!filterProcessingResultsReady) return;

  const selector = useActivityFilterStore.getState().filter;

  useSpatialIndexReadinessStore.getState().setReady(false);

  const result = await updateIndex({ originType, selector });

  if (result) useSpatialIndexReadinessStore.getState().setReady(true);
}
