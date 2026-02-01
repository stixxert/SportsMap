import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import {
  SPATIAL_INDEX_KEY,
  SpatialDataType,
} from "@/features/activity-aggregation/spatial-index/types";
import { ApiType } from "@/types/configuration-types";
import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";
import { Point } from "@/types/types";
import { FEATURE_COLLECTION_INDEX_KEY } from "@/features/activity-aggregation/map-activity-features/types";

export const AggregationTask = {
  spatial: SPATIAL_INDEX_KEY,
  featureCollection: FEATURE_COLLECTION_INDEX_KEY,
} as const;

export interface AggregationTask {
  taskType: AggregationTaskType;
  originType: ApiType;
  selector: ActivityAggregationSelector;
}

export interface AggregationWorkerActions {
  processWorkerTask: typeof processWorkerTask;
}

export type AggregationTaskType =
  (typeof AggregationTask)[keyof typeof AggregationTask];

export interface BrokenDownActivityType {
  input: Point[];
  owner: SpatialDataType;
}

export type AggregationInput = BrokenDownActivityType[];

export type AggregationOutput = unknown;

export type AggregationIndexerFn<
  T = AggregationInput,
  R = AggregationOutput,
> = (input: T) => R;

export interface TaskAggregator {
  aggregate: AggregationIndexerFn;
  mergeAggregate: AggregationIndexerFn<unknown[]>;
}
export type MergeAggregationInput<T> = { [key: string]: T };
