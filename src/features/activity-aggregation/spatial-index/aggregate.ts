import {
  AggregationIndexerFn,
  AggregationInput,
  AggregationOutput,
} from "@/features/activity-aggregation/types/aggregation";
import {
  SPATIAL_INDEX_KEY,
  SpatialDataIndex,
  SpatialDataObject,
  SpatialDataType,
} from "@/features/activity-aggregation/spatial-index/types";
import { createLineSegmentBounds } from "@/features/activity-aggregation/lib/map-breakdown";
import RBush from "rbush";
import { subscribeToAggregation } from "@/features/activity-aggregation/lib/aggregate";
import { AggregatedIndexValue } from "@/features/activity-aggregation/lib/schema";

export const transformData: AggregationIndexerFn<
  AggregationInput,
  AggregationOutput<SpatialDataIndex>
> = (input: AggregationInput) => {
  const activityLineBounds = input
    .map((activity) =>
      activity.input.map((line) =>
        createLineSegmentBounds<SpatialDataType>(line, {
          data: activity.owner,
        }),
      ),
    )
    .flat();

  const index = new RBush<SpatialDataObject>();
  index.load(activityLineBounds);

  return {
    output: index.toJSON(),
    aggregationType: SPATIAL_INDEX_KEY,
  };
};

subscribeToAggregation(transformData);

export function getSpatialIndexFromAggregateIndex(
  aggregateIndex: AggregatedIndexValue,
): SpatialDataIndex | undefined {
  const spatialIndex = aggregateIndex.spatialIndex;

  if (!spatialIndex) return undefined;

  return new RBush<SpatialDataObject>().fromJSON(spatialIndex);
}
