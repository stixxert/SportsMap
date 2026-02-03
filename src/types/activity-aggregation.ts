import RBush, { BBox } from "rbush";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { DBSchema } from "idb";

import { ApiType } from "@/lib/auth/api-types";

export const AggregationCategory = {
  Spatial: "spatialIndex",
  FeatureCollection: "featureCollectionIndex",
} as const;

export type AggregationTaskType =
  (typeof AggregationCategory)[keyof typeof AggregationCategory];

export const AGGREGATION_INDEXES = {
  TYPE_START: "TYPE_START",
  TYPE_START_END: "TYPE_START_END",
};

export interface AggregateIndex {
  index: unknown;
}

export interface AggregatedIndex
  extends ActivityAggregationSelector,
    AggregateIndex {
  updatedAt: Date;
}

export type AggregatedSchemaIndex = Omit<AggregatedIndex, "sportType"> & {
  sportType: string;
};

interface BaseAggregatedIndexSchema {
  key: [string, Date, Date];
  value: AggregatedSchemaIndex;
  indexes: {
    [AGGREGATION_INDEXES.TYPE_START]: [string, Date];
    [AGGREGATION_INDEXES.TYPE_START_END]: [string, Date, Date];
  };
}

export interface AggregatedIndexesSchema extends DBSchema {
  [AggregationCategory.Spatial]: BaseAggregatedIndexSchema;
  [AggregationCategory.FeatureCollection]: BaseAggregatedIndexSchema;
}

export interface DataIndexObject<T> extends BBox {
  data: T;
}

export type DataIndex<T> = T extends BBox
  ? RBush<T>
  : RBush<DataIndexObject<T>>;

export type AggregationDispatcherFn = (
  originType: ApiType,
  selectionOptions: ActivityAggregationSelector,
) => Promise<void>;
