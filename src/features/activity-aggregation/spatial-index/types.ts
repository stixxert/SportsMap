import { SummaryActivity } from "@/strava-api";
import {
  DataIndex,
  DataIndexObject,
} from "@/features/activity-aggregation/types/data";
import { SchemaEntry } from "@/features/activity-aggregation/lib/schema";

export type SpatialDataType = NonNullable<SummaryActivity["id"]>;

export type SpatialDataObject = DataIndexObject<SpatialDataType>;

export type SpatialDataIndex = DataIndex<SpatialDataObject>;

export const SPATIAL_INDEX_KEY = "spatialIndex";

export interface SpatialIndexSchemaEntry extends SchemaEntry {
  [SPATIAL_INDEX_KEY]: string;
}
