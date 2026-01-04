import { SportType } from "@/strava-api";
import { SummaryAthlete } from "@/strava-api";

export type Result<SuccessType, ErrorType> =
  | { success: true; value: SuccessType }
  | { success: false; error: ErrorType };

export type AccessToken = {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
};

export type ActivitiesCategoryParams = {
  startTime?: Date;
  endTime?: Date;
  sportType?: SportType | SportType[];
};

export type SyncMetaData = {
  athleteId: SummaryAthlete["id"];
  lastSync: Date;
};
