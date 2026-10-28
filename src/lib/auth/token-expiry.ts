import type { AccessToken } from "@/types/types";

/** Refresh when the access token has less than this much life left. */
export const REFRESH_MARGIN_MS = 10 * 60 * 1000;

/**
 * Strava returns `expires_at` in epoch *seconds*; `Date.now()` is milliseconds. The
 * previous check compared the two directly, so `now + 10min < expires_at` (seconds) was
 * effectively always false and a stale token was never refreshed — every request then
 * 401'd and the error path deleted the user's local database.
 */
export function accessTokenIsStale(
  accessToken: AccessToken | null,
  now = Date.now(),
): boolean {
  if (!accessToken) return true;

  // Treat an absent/garbled expiry as stale rather than as "valid forever".
  if (!Number.isFinite(accessToken.expires_at)) return true;

  return accessToken.expires_at * 1000 - now < REFRESH_MARGIN_MS;
}
