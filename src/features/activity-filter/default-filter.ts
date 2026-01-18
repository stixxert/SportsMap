import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import { ALL_SPORTS_TYPES } from "@/features/activity-aggregation/lib/schema";

export const defaultFilter: ActivityAggregationSelector = {
  startDate: new Date(0),
  endDate: new Date(Date.now()),
  sportType: ALL_SPORTS_TYPES,
};
