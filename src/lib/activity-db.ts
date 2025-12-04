import { SummaryActivity } from "@/strava-api";
import { DBSchema, IDBPDatabase, openDB } from "idb";
import { ApiConfigurationType } from "@/src/types/configuration-types";

export const DATABASE_NAME = "sports-db";
export const ACTIVITY_STORE_NAME = "activities";

export const INDEX_ID = "by-id";
export const INDEX_TYPE = "by-type";

interface ActivityDBSchema extends DBSchema {
  activities: {
    value: {
      [K in keyof SummaryActivity]?: SummaryActivity[K];
    };
    key: string;
    indexes: { "by-id": string; "by-type": string };
  };
}

export type ActivityDB = IDBPDatabase<ActivityDBSchema>;

export async function openActivityDB(
  activityConfigurationType: ApiConfigurationType,
): Promise<ActivityDB> {
  return openDB<ActivityDBSchema>(
    `${DATABASE_NAME}-${activityConfigurationType.toString()}`,
    1,
    {
      upgrade(db) {
        const activitiesStore = db.createObjectStore(ACTIVITY_STORE_NAME, {
          keyPath: "id",
        });

        activitiesStore.createIndex(INDEX_ID, "id", { unique: true });
        activitiesStore.createIndex(INDEX_TYPE, "type", { unique: false });
      },
    },
  );
}

export async function addActivities(
  db: ActivityDB,
  activities: SummaryActivity[],
): Promise<void> {
  const tx = db.transaction(ACTIVITY_STORE_NAME, "readwrite");

  const addActivitiesPromises = activities.map(async (activity) => {
    await tx.store.add(activity);
  });

  return Promise.all([...addActivitiesPromises, tx.done]).then(() => {});
}
