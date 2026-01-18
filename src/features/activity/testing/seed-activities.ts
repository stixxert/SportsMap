import { ACTIVITY_STORE } from "@/features/activity/lib/data/schema";
import { generateNumActivities } from "@/features/demo-data/activity-generation";
import { ActivityDatabase } from "@/lib/db/origin-related-activity-db";

export async function seedActivities(
  db: ActivityDatabase,
  numActivities: number,
) {
  const tx = db.transaction(ACTIVITY_STORE, "readwrite");

  const activities = generateNumActivities(numActivities);

  await Promise.all([
    ...activities.map((activity) => tx.store.put(activity)),
    tx.done,
  ]);
}
