import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";

import { Point } from "@/types/geo";
import { SpatialDataType } from "@/lib/activity-aggregation/spatial-index";

export interface AggregationWorkerActions {
  processWorkerTask: typeof processWorkerTask;
}

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
