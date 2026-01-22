import * as Comlink from "comlink";
import { AgnosticInteractionSearch } from "@/features/maps/lib/spatial/search";
import { SummaryActivity } from "@/strava-api";
import { MapIndexWorkerUpdate } from "@/features/maps/types/types";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import { useActivityFilterStore } from "@/features/activity-filter/stores/active-filter-store";
import { spatialIndexWorkerActions } from "@/features/maps/lib/spatial/worker-actions";

export type WorkerActions = typeof spatialIndexWorkerActions;

type Remote<T> = ReturnType<typeof Comlink.wrap<T>>;

const worker: { ref: Remote<WorkerActions> | undefined } = {
  ref: undefined,
};

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

  await worker.ref.setIndexState(newState);
}

export async function updateIndexWithMarshalling() {
  const originType = useApiTypeStore.getState().apiType;

  if (!originType) return;

  const selector = useActivityFilterStore.getState().filter;

  await updateIndex({ originType, selector });
}
