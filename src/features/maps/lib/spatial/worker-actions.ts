"use client";

import {
  createMapIndexWorkerStateStore,
  MapIndexWorkerState,
} from "@/features/maps/lib/base-worker";
import {
  AgnosticInteractionSearch,
  getViewActivitiesImpl,
} from "@/features/maps/lib/spatial/search";
import {
  SpatialDataIndex,
  SpatialDataObject,
} from "@/features/activity-aggregation";
import RBush from "rbush";
import { MapIndexWorkerUpdate } from "@/features/maps/types/types";
import { getSpatialIndexFromAggregateIndex } from "@/features/activity-aggregation/spatial-index/aggregate";
import { getAggregatedData } from "@/features/activity-aggregation/lib/schema";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
export const SPATIAL_SEARCH_WORKER = "spatialSearch";

interface WorkerState extends MapIndexWorkerState {
  index: SpatialDataIndex;
}

function getViewActivitiesWrapper(workerState: WorkerState) {
  return (view: AgnosticInteractionSearch) =>
    getViewActivitiesImpl(
      workerState.indexObservationState.originType,
      workerState.index,
      view,
    );
}

const workerState: WorkerState = Object.assign(
  { index: new RBush<SpatialDataObject>() },
  createMapIndexWorkerStateStore(),
);

export const spatialIndexWorkerActions = Object.assign(
  {
    getViewActivities: getViewActivitiesWrapper(workerState),
    setIndexState: async function (newState: MapIndexWorkerUpdate) {
      Object.assign(workerState.indexObservationState, newState);

      const db = await openActivityDatabase(newState.originType);

      const aggregatedIndex = await getAggregatedData(
        db,
        AggregationTask.spatial,
        newState.selector,
      );

      let newIndex = new RBush<SpatialDataObject>();

      if (aggregatedIndex) {
        const _newIndex = getSpatialIndexFromAggregateIndex(aggregatedIndex);

        if (_newIndex) newIndex = _newIndex;
      }

      Object.assign(workerState, { index: newIndex });
    },
  },
  workerState,
);
