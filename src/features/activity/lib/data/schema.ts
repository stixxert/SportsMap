import { DBSchema } from "idb";
import { SportType, SummaryActivity } from "@/strava-api";
import { subscribeToActivityDbUpgrade } from "@/lib/db/origin-related-activity-db";

export const ACTIVITY_STORE = "activities";

export const INDEXES = {
  ID: "ID",
  TYPE: "TYPE",
  DATE: "DATE",
  TYPE_DATE: "TYPE_DATE",
};

export interface ActivityStoreSchema extends DBSchema {
  [ACTIVITY_STORE]: {
    value: {
      [K in keyof SummaryActivity]?: SummaryActivity[K];
    };
    key: NonNullable<SummaryActivity["id"]>;
    indexes: {
      [INDEXES.ID]: NonNullable<SummaryActivity["id"]>;
      [INDEXES.TYPE]: SportType;
      [INDEXES.DATE]: Date;
      [INDEXES.TYPE_DATE]: [string, Date];
    };
  };
}

subscribeToActivityDbUpgrade((db) => {
  const activitiesStore = db.createObjectStore(ACTIVITY_STORE, {
    keyPath: "id",
  });

  activitiesStore.createIndex(INDEXES.ID, "id", { unique: true });
  activitiesStore.createIndex(INDEXES.TYPE, "sportType", { unique: false });
  activitiesStore.createIndex(INDEXES.DATE, "startDate", { unique: false });
  activitiesStore.createIndex(INDEXES.TYPE_DATE, ["sportType", "startDate"], {
    unique: false,
  });
});
