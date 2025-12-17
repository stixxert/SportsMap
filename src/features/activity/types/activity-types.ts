import { SummaryAthlete } from "@/strava-api";

export type SyncMetaData = {
  athleteId: SummaryAthlete["id"];
  lastSync: Date;
};
