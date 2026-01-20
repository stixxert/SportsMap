import {
  AggregationIndexerFn,
  AggregationInput,
  MergeAggregationInput,
} from "@/features/activity-aggregation/types/aggregation";
import {
  SPATIAL_INDEX_KEY,
  SpatialDataIndex,
  SpatialDataObject,
  SpatialDataType,
} from "@/features/activity-aggregation/spatial-index/types";
import { createLineSegmentBounds } from "@/features/activity-aggregation/lib/map-breakdown";
import RBush from "rbush";
import {
  subscribeToAggregation,
  subscribeToMergeAggregation,
} from "@/features/activity-aggregation/lib/aggregate";
import { AggregatedIndexValue } from "@/features/activity-aggregation/lib/schema";

export const transformData: AggregationIndexerFn = (
  input: AggregationInput,
) => {
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

export const mergeTransformedIndexes: AggregationIndexerFn<
  MergeAggregationInput<unknown>[]
> = (input: MergeAggregationInput<unknown>[]) => {
  let mergedIndex: SpatialDataIndex | undefined = undefined;

  for (const wrappedIndex of input) {
    if (!Object.hasOwn(wrappedIndex, SPATIAL_INDEX_KEY)) continue;

    const index = wrappedIndex[SPATIAL_INDEX_KEY];

    if (!mergedIndex) {
      mergedIndex = constructSpatialIndex(index);
      continue;
    }

    mergedIndex = mergedIndex.load(constructSpatialIndex(index).all());
  }

  return {
    output: (mergedIndex ?? new RBush<SpatialDataObject>()).toJSON(),
    aggregationType: SPATIAL_INDEX_KEY,
  };
};

subscribeToAggregation(transformData);

subscribeToMergeAggregation(mergeTransformedIndexes);

function constructSpatialIndex(index: unknown) {
  return new RBush<SpatialDataObject>().fromJSON(index);
}

export function getSpatialIndexFromAggregateIndex(
  aggregateIndex: AggregatedIndexValue,
): SpatialDataIndex | undefined {
  const spatialIndex = aggregateIndex[SPATIAL_INDEX_KEY];

  if (!spatialIndex) return undefined;

  return constructSpatialIndex(spatialIndex);
}
