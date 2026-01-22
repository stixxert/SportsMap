import {
  ActivityAggregationSelector,
  ActivityLineSegments,
} from "@/features/activity-aggregation/types/data";
import { SpatialDataType } from "@/features/activity-aggregation/spatial-index/types";
import { ApiType } from "@/types/configuration-types";
import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";

export const AggregationTask = {
  heat: "heatIndex",
  spatial: "spatialIndex",
} as const;

export interface AggregationTask {
  taskType: AggregationTaskType;
  originType: ApiType;
  selector: ActivityAggregationSelector;
}

export interface AggregationResult {
  completed: boolean;
  data: string | unknown | undefined;
}

export interface AggregationWorkerActions {
  processWorkerTask: typeof processWorkerTask;
}

export type AggregationTaskType =
  (typeof AggregationTask)[keyof typeof AggregationTask];

export interface BrokenDownActivityType {
  input: ActivityLineSegments;
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
