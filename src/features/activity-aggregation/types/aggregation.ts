import { ActivityLineSegments } from "@/features/activity-aggregation/types/data";
import { SpatialDataType } from "@/features/activity-aggregation/spatial-index/types";

export const TASKS = {
  heat: "heat",
  spatial: "spatial",
} as const;

export type TaskType = (typeof TASKS)[keyof typeof TASKS];

export interface BrokenDownActivityType {
  input: ActivityLineSegments;
  owner: SpatialDataType;
}

export type AggregationInput = BrokenDownActivityType[];

export interface AggregationOutput<T> {
  aggregationType: string;
  output: T;
}

export type AggregationIndexerFn<
  T = AggregationInput,
  R = AggregationOutput<unknown>,
> = (input: T) => R;
