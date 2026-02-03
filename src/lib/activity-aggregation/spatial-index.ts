import {
  AggregatedIndex,
  DataIndex,
  DataIndexObject,
} from "@/types/activity-aggregation";
import RBush from "rbush";
import { ActivityId } from "@/types/activity-selection";

export type SpatialDataType = NonNullable<ActivityId>;

export type SpatialDataObject = DataIndexObject<SpatialDataType>;

export type SpatialDataIndex = DataIndex<SpatialDataObject>;

export function constructSpatialIndex() {
  return new RBush<SpatialDataObject>();
}

export function aggregateIndexGetSpatialIndex(
  aggregateIndex: AggregatedIndex,
): SpatialDataIndex | undefined {
  const spatialIndex = aggregateIndex.index;

  if (!spatialIndex) return undefined;

  return constructSpatialIndex().fromJSON(spatialIndex);
}
