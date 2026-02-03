import { SportType, SummaryActivity } from "@/strava-api";

export interface ActivityAggregationSelector {
  startDate: Date;
  endDate: Date;
  sportType: SportType | SportType[];
}

export type ActivitySelectionOptions = Partial<ActivityAggregationSelector>;
export type ActivityId = NonNullable<SummaryActivity["id"]>;
