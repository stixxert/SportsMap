import {
  DataIndex,
  DataIndexObject,
} from "@/features/activity-aggregation/types/data";
import { SchemaEntry } from "@/features/activity-aggregation/lib/schema";
import { Point } from "@/types/types";

/* [xmin, ymin, xmax, ymax] - flipped to [ymin, xmax, ...] for LatLng */
export type TileBounds = [number, number, number, number];

export type BaseHeatTile = Point[];

export type BaseHeatTileDataObject = DataIndexObject<BaseHeatTile>;

export type BaseHeatTileDataIndex = DataIndex<BaseHeatTileDataObject>;

export const HEAT_TILES_INDEX_KEY = "heatTileIndex";

export interface HeatTileIndexSchemaEntry extends SchemaEntry {
  [HEAT_TILES_INDEX_KEY]: string;
}
