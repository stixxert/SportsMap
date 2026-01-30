import * as Comlink from "comlink";
import { AgnosticInteractionSearch } from "@/features/maps/lib/spatial/search";
import { SummaryActivity } from "@/strava-api";
import { MapIndexWorkerUpdate } from "@/features/maps/types/types";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import {
  useActivityFilterStore,
  useFilterAggregationProcessingStore,
} from "@/features/activity-filter/stores/active-filter-store";
import { spatialIndexWorkerActions } from "@/features/maps/lib/spatial/worker-actions";
import { createWorkerReadinessStateStore } from "@/features/maps/lib/base-worker";

export type WorkerActions = typeof spatialIndexWorkerActions;

type Remote<T> = ReturnType<typeof Comlink.wrap<T>>;

const worker: { ref: Remote<WorkerActions> | undefined } = {
  ref: undefined,
};

export const useSpatialIndexReadinessStore = createWorkerReadinessStateStore();

export function setSpatialSearchWorker(newWorker: Worker) {
  worker.ref = Comlink.wrap(newWorker);
}

export async function getViewActivities(
  view: AgnosticInteractionSearch,
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

  const filterLoading = useFilterAggregationProcessingStore.getState().loading;

  if (filterLoading) return;

  const selector = useActivityFilterStore.getState().filter;

  useSpatialIndexReadinessStore.getState().setReady(false);

  const result = await updateIndex({ originType, selector });

  if (result) useSpatialIndexReadinessStore.getState().setReady(true);
}
