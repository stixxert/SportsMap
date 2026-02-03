import { generateNumActivities } from "@/lib/demo-data/activity-generation";
import {
  ACTIVITY_STORES,
  ActivityDatabase,
} from "@/lib/activity/activity-schema";

export async function seedActivities(
  db: ActivityDatabase,
  numActivities: number,
  startIndex?: number,
  dateBounds?: { start?: Date; end?: Date },
) {
  const tx = db.transaction(ACTIVITY_STORES.Activity, "readwrite");

  const activities = generateNumActivities(
    numActivities,
    startIndex ?? 0,
    dateBounds,
  );

  await Promise.all([
    ...activities.map((activity) => tx.store.put(activity)),
    tx.done,
  ]);
}
