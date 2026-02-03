"use client";

import {
  defaultMapIndexWorkerState,
  MapIndexWorkerState,
  MapIndexWorkerUpdate,
} from "@/features/maps/lib/base-worker";
import {
  InteractionSearch,
  getViewActivitiesImpl,
} from "@/features/maps/lib/spatial/search";
import { openActivityDatabase } from "@/lib/activity/db";
import { compressSpan } from "@/lib/activity/sport-type-compression";
import { AggregationCategory } from "@/types/activity-aggregation";
import { getAggregatedData } from "@/lib/activity-aggregation/aggregation-schema";
import {
  aggregateIndexGetSpatialIndex,
  constructSpatialIndex,
  SpatialDataIndex,
} from "@/lib/activity-aggregation/spatial-index";

export const SPATIAL_SEARCH_WORKER = "spatialSearch";

interface WorkerState extends MapIndexWorkerState {
  index: SpatialDataIndex;
  updatedAt: Date;
}

function getViewActivitiesWrapper(workerState: WorkerState) {
  return (view: InteractionSearch) =>
    getViewActivitiesImpl(
      workerState.indexObservationState.originType,
      workerState.index,
      view,
    );
}

const workerState: WorkerState = Object.assign(
  { index: constructSpatialIndex(), updatedAt: new Date(0) },
  { ...defaultMapIndexWorkerState },
);

export const spatialIndexWorkerActions = Object.assign(
  {
    getViewActivities: getViewActivitiesWrapper(workerState),
    setIndexState: async function (newState: MapIndexWorkerUpdate) {
      Object.assign(workerState.indexObservationState, newState);

      const db = await openActivityDatabase(newState.originType);

      const aggregatedIndex = await getAggregatedData(
        db,
        AggregationCategory.Spatial,
        newState.selector,
      );

      if (!aggregatedIndex) throw new Error("Missing aggregated index");

      if (
        compressSpan(aggregatedIndex.sportType) ===
          compressSpan(workerState.indexObservationState.selector.sportType) &&
        aggregatedIndex.startDate.getTime() ===
          workerState.indexObservationState.selector.startDate.getTime() &&
        aggregatedIndex.endDate.getTime() ===
          workerState.indexObservationState.selector.endDate.getTime() &&
        workerState.updatedAt.getTime() === aggregatedIndex.updatedAt.getTime()
      )
        return true;

      let newIndex;

      if (aggregatedIndex) {
        const _newIndex = aggregateIndexGetSpatialIndex(aggregatedIndex);

        if (_newIndex) newIndex = _newIndex;
      } else newIndex = constructSpatialIndex();

      Object.assign(workerState, {
        index: newIndex,
        updatedAt: aggregatedIndex.updatedAt,
      });

      return true;
    },
  },
  workerState,
);
