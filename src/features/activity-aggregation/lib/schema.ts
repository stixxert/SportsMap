import {
  AGGREGATION_INDEXES,
  AggregationCategory,
  AggregationTaskType,
} from "@/types/activity-aggregation";
import { ActivityDatabase } from "@/lib/activity/activity-schema";
import { subscribeToActivityDbUpgrade } from "@/lib/activity/register-db-extensions";

function setupStore(db: ActivityDatabase, storeName: AggregationTaskType) {
  const indexStore = db.createObjectStore(storeName, {
    keyPath: ["sportType", "startDate", "endDate"],
  });

  indexStore.createIndex(
    AGGREGATION_INDEXES.TYPE_START,
    ["sportType", "startDate"],
    {
      unique: false,
    },
  );
  indexStore.createIndex(
    AGGREGATION_INDEXES.TYPE_START_END,
    ["sportType", "startDate", "endDate"],
    { unique: true },
  );
}

subscribeToActivityDbUpgrade((db) => {
  for (const store of Object.values(AggregationCategory)) {
    setupStore(db, store);
  }
});
