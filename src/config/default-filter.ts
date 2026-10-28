import { MAX_UPPER_BOUNDS } from "@/utils/db";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { SportType } from "@/lib/strava/types";

export const defaultFilter: ActivityAggregationSelector = {
  startDate: new Date(0),
  endDate: MAX_UPPER_BOUNDS.date,
  sportType: [SportType.Run, SportType.TrailRun],
};
