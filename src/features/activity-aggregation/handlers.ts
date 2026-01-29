import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { spatialAggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";
import { heatAggregateHandlers } from "@/features/activity-aggregation/heat-tiles/aggregate";

export const aggregationHandlers = {
  [AggregationTask.spatial]: spatialAggregateHandlers,
  [AggregationTask.heat]: heatAggregateHandlers,
};
