import { SummaryActivity } from "@/strava-api";
import { DBSchema, IDBPDatabase, openDB } from "idb";

interface ActivitiesDB extends DBSchema {
  activities: {
    value: {
      [K in keyof SummaryActivity]?: SummaryActivity[K];
    };
    key: string;
    indexes: { "by-id": string; "by-type": string };
  };
}

export async function getActivitiesDB(): Promise<IDBPDatabase<ActivitiesDB>> {
  return openDB<ActivitiesDB>("activities", 1, {
    upgrade(db) {
      const activitiesStore = db.createObjectStore("activities", {
        keyPath: "id",
      });

      activitiesStore.createIndex("by-id", "id");
      activitiesStore.createIndex("by-type", "type");
    },
  });
}

export async function addActivities(
  db: IDBPDatabase<ActivitiesDB>,
  activities: SummaryActivity[],
): Promise<void> {
  const tx = db.transaction("activities", "readwrite");

  const addActivitiesPromises = activities.map(async (activity) => {
    await tx.store.add(activity);
  });

  return Promise.all([...addActivitiesPromises, tx.done]).then(() => {});
}
