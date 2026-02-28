import { SportType, SummaryActivity } from "@/src/generated/strava-api";

export interface ActivityAggregationSelector {
  startDate: Date;
  endDate: Date;
  sportType: SportType | SportType[];
}

export type ActivitySelectionOptions = Partial<ActivityAggregationSelector>;
export type ActivityId = NonNullable<SummaryActivity["id"]>;
