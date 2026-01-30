import { ACTIVITY_STORE } from "@/features/activity/lib/data/schema";
import { generateNumActivities } from "@/features/activity/demo-data/activity-generation";
import { ActivityDatabase } from "@/lib/db/origin-related-activity-db";

export async function seedActivities(
  db: ActivityDatabase,
  numActivities: number,
  startIndex?: number,
  dateBounds?: { start?: Date; end?: Date },
) {
  const tx = db.transaction(ACTIVITY_STORE, "readwrite");

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
