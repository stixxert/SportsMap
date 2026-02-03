import { Logout as AuthLogout } from "@/lib/auth/auth-actions";
import { deleteAllOrigins } from "@/lib/activity/db";

export async function Logout() {
  await AuthLogout();

  await deleteAllOrigins();
}
