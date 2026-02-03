import {
  AggregationIndexerFn,
  AggregationInput,
  AggregationOutput,
} from "@/features/activity-aggregation/types/aggregation";

import {
  convPolylineToLineSegments,
  createLineSegmentBounds,
} from "@/lib/activity-map-breakdown";
import {
  constructSpatialIndex,
  SpatialDataIndex,
  SpatialDataType,
} from "@/lib/activity-aggregation/spatial-index";

export const transformData: AggregationIndexerFn = (
  input: AggregationInput,
) => {
  const activityLineBounds = input
    .map((activity) =>
      convPolylineToLineSegments(activity.input).map((line) =>
        createLineSegmentBounds<SpatialDataType>(line, {
          data: activity.owner,
        }),
      ),
    )
    .flat();

  const index = constructSpatialIndex();
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
      mergedIndex = constructSpatialIndex().fromJSON(index);
      continue;
    }

    mergedIndex = mergedIndex.load(
      constructSpatialIndex().fromJSON(index).all(),
    );
  }

  return (mergedIndex ?? constructSpatialIndex()).toJSON();
};

export const spatialAggregateHandlers = {
  aggregate: transformData,
  mergeAggregate: mergeTransformedIndexes,
};
