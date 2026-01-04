import { Logout as AuthLogout } from "@/features/auth/lib/user";
import { deleteKVDb } from "@/lib/kv-db";
import { deleteAllActivities } from "@/features/activity/lib/activity-db";

export async function Logout() {
  await AuthLogout();

  await deleteKVDb();
  await deleteAllActivities();
}
