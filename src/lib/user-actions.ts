import { Logout as AuthLogout } from "@/features/auth/lib/user";
import { deleteKVDb } from "@/lib/db/kv-db";
import { deleteAllOrigins } from "@/lib/db/origin-related-activity-db";

export async function Logout() {
  await AuthLogout();

  await deleteKVDb();
  await deleteAllOrigins();
}
