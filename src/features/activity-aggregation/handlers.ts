import { spatialAggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";
import { featureCollectionAggregateHandlers } from "@/features/activity-aggregation/map-activity-features/aggregate";
import { AggregationCategory } from "@/types/activity-aggregation";

export const aggregationHandlers = {
  [AggregationCategory.Spatial]: spatialAggregateHandlers,
  [AggregationCategory.FeatureCollection]: featureCollectionAggregateHandlers,
};
