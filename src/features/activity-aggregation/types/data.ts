import RBush, { BBox } from "rbush";
import { LatLngTuple } from "leaflet";
import { ActivitySelectionOptions } from "@/features/activity/lib/data/store-actions";

export type LineSegment = LatLngTuple[];

export type ActivityLineSegments = LineSegment[];

export interface DataIndexObject<T> extends BBox {
  data: T;
}

export type DataIndex<T> = T extends BBox
  ? RBush<T>
  : RBush<DataIndexObject<T>>;

export type ActivityAggregationSelector = Required<ActivitySelectionOptions>;
