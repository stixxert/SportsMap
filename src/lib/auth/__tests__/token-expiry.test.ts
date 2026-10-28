import { describe, expect, test } from "vitest";

import { accessTokenIsStale, REFRESH_MARGIN_MS } from "@/lib/auth/token-expiry";
import type { AccessToken } from "@/types/types";

const NOW = 1_700_000_000_000; // ms

const tokenExpiringIn = (seconds: number): AccessToken => ({
  token_type: "Bearer",
  access_token: "a",
  // Strava sends epoch SECONDS here.
  expires_at: Math.floor((NOW + seconds * 1000) / 1000),
  expires_in: seconds,
});

describe("access token expiry", () => {
  test("treats a missing token as stale", () => {
    expect(accessTokenIsStale(null, NOW)).toBe(true);
  });

  test("uses a seconds-based expires_at (not milliseconds)", () => {
    // A token valid for another hour must not be considered stale...
    expect(accessTokenIsStale(tokenExpiringIn(3600), NOW)).toBe(false);

    // ...while one that expires within the refresh margin must be.
    expect(accessTokenIsStale(tokenExpiringIn(60), NOW)).toBe(true);
  });

  test("refreshes exactly at the margin", () => {
    const marginSeconds = REFRESH_MARGIN_MS / 1000;

    expect(accessTokenIsStale(tokenExpiringIn(marginSeconds - 1), NOW)).toBe(true);
    expect(accessTokenIsStale(tokenExpiringIn(marginSeconds + 1), NOW)).toBe(false);
  });
});
