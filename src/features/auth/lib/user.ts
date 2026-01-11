"use client";

import { rehydrateAccessToken } from "@/features/auth/stores/auth-store";
import { deleteServerOnlyTokens } from "@/features/auth/lib/server-flow";
import { ACCESS_TOKEN_COOKIE } from "@/config/cookie-settings";
import { deleteCookie } from "cookies-next/client";

const DEAUTHORIZE_URL = "https://www.strava.com/oauth/deauthorize";

export async function Logout() {
  await deleteServerOnlyTokens();
  deleteCookie(ACCESS_TOKEN_COOKIE.key, ACCESS_TOKEN_COOKIE.options);
  await rehydrateAccessToken();

  await fetch(DEAUTHORIZE_URL, { method: "POST" });

  window.location.reload();
}
