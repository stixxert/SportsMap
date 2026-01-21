import {
  AggregationIndexerFn,
  AggregationInput,
  AggregationOutput,
} from "@/features/activity-aggregation/types/aggregation";
import {
  SpatialDataIndex,
  SpatialDataObject,
  SpatialDataType,
} from "@/features/activity-aggregation/spatial-index/types";
import { createLineSegmentBounds } from "@/features/activity-aggregation/lib/map-breakdown";
import RBush from "rbush";
import { AggregatedIndex } from "@/features/activity-aggregation/lib/schema";
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

  return index.toJSON();
};

export const mergeTransformedIndexes: AggregationIndexerFn<
  AggregationOutput[]
> = (input: AggregationOutput[]) => {
  let mergedIndex: SpatialDataIndex | undefined = undefined;

  for (const index of input) {
    if (!index) continue;

    if (!mergedIndex) {
      mergedIndex = constructSpatialIndex(index);
      continue;
    }

    mergedIndex = mergedIndex.load(constructSpatialIndex(index).all());
  }

  return (mergedIndex ?? new RBush<SpatialDataObject>()).toJSON();
};

export const aggregateHandlers = {
  aggregate: transformData,
  mergeAggregate: mergeTransformedIndexes,
};

function constructSpatialIndex(index: unknown) {
  return new RBush<SpatialDataObject>().fromJSON(index);
}

export function getSpatialIndexFromAggregateIndex(
  aggregateIndex: AggregatedIndex,
): SpatialDataIndex | undefined {
  const spatialIndex = aggregateIndex.index;

  if (!spatialIndex) return undefined;

  return constructSpatialIndex(spatialIndex);
}
