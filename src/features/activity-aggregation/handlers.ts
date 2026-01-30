import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { spatialAggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";

export const aggregationHandlers = {
  [AggregationTask.spatial]: spatialAggregateHandlers,
};
