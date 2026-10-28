import { SportType, Activity } from "@/lib/strava/types";

export interface ActivityAggregationSelector {
  startDate: Date;
  endDate: Date;
  sportType: SportType | SportType[];
}

export type ActivitySelectionOptions = Partial<ActivityAggregationSelector>;
export type ActivityId = NonNullable<Activity["id"]>;
