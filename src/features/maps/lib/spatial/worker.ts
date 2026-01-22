import * as Comlink from "comlink";
import { spatialIndexWorkerActions } from "@/features/maps/lib/spatial/worker-actions";
import { createMapIndexWorkerStateStore } from "@/features/maps/lib/base-worker";

const actions = Object.assign(
  {
    getViewActivities: () => {},
    setIndexState: () => {},
    index: undefined,
  },
  createMapIndexWorkerStateStore(),
);

Comlink.expose(spatialIndexWorkerActions);
