import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { spatialAggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";
import { featureCollectionAggregateHandlers } from "@/features/activity-aggregation/map-activity-features/aggregate";
import { thisHandler } from "@/features/activity-aggregation/map-activity-features/aggregate";

export const aggregationHandlers = {
  [AggregationTask.spatial]: spatialAggregateHandlers,
  [AggregationTask.featureCollection]: featureCollectionAggregateHandlers,
};
