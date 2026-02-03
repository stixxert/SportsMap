import { subscribeToActivityDbUpgrade } from "@/lib/activity/db";
import {
  ACTIVITY_INDEXES,
  ACTIVITY_STORES,
} from "@/lib/activity/activity-schema";

subscribeToActivityDbUpgrade((db) => {
  const activitiesStore = db.createObjectStore(ACTIVITY_STORES.Activity, {
    keyPath: "id",
  });

  activitiesStore.createIndex(ACTIVITY_INDEXES.ID, "id", { unique: true });
  activitiesStore.createIndex(ACTIVITY_INDEXES.TYPE, "sportType", {
    unique: false,
  });
  activitiesStore.createIndex(ACTIVITY_INDEXES.DATE, "startDate", {
    unique: false,
  });
  activitiesStore.createIndex(
    ACTIVITY_INDEXES.TYPE_DATE,
    ["sportType", "startDate"],
    {
      unique: false,
    },
  );
});
