import { SummaryActivity } from "@/strava-api";
import { ApiType } from "@/types/configuration-types";
import { ActivityAggregationSelector } from "@/features/activity-aggregation";
import { Point } from "@/types/types";

export type ActivityId = NonNullable<SummaryActivity["id"]>;

export interface MapIndexWorkerUpdate {
  originType: ApiType;
  selector: ActivityAggregationSelector;
}

export type PointBounds = [Point, Point];
