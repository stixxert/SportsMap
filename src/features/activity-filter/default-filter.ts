import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import { ALL_SPORTS_TYPES } from "@/features/activity-aggregation/lib/schema";
import { MAX_UPPER_BOUNDS } from "@/utils/db";

export const defaultFilter: ActivityAggregationSelector = {
  startDate: new Date(0),
  endDate: MAX_UPPER_BOUNDS.date,
  sportType: ALL_SPORTS_TYPES,
};
