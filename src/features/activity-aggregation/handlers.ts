import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { aggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";

export const aggregationHandlers = {
  [AggregationTask.spatial]: aggregateHandlers,
  [AggregationTask.heat]: aggregateHandlers,
};
