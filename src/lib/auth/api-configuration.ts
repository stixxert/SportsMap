"use client";

import { AccessToken, Result } from "@/types/types";
import {
  useStravaClientStore,
  useApiTypeStore,
} from "@/lib/auth/api-store";
import type { StravaClient } from "@/lib/strava/client";
import { createStravaClient } from "@/lib/strava/client";
import {
  rehydrateAccessToken,
  useAccessTokenStore,
} from "@/lib/auth/auth-store";
import {
  exchangeRefreshToken,
  isAuthenticated,
} from "@/lib/auth/server-exchange";
import { ApiType } from "@/lib/auth/api-types";

import { accessTokenIsStale } from "@/lib/auth/token-expiry";

export function readApiTypeString(apiType: string): ApiType | undefined {
  const modeUppercase = apiType.toUpperCase();

  if (modeUppercase === ApiType.Strava) {
    return ApiType.Strava;
  } else if (modeUppercase === ApiType.Demo) {
    return ApiType.Demo;
  }

  return undefined;
}

/**
 * Demo mode never calls the Strava API — its activities are generated locally — so it
 * needs no client. (It previously produced one pointed at a non-existent `/api/demo`
 * endpoint, which was dead configuration.)
 */
export function createClient(
  apiType: ApiType,
  accessToken?: AccessToken,
): StravaClient | null {
  if (apiType !== ApiType.Strava || !accessToken) return null;

  return createStravaClient({
    accessToken: `${accessToken.token_type} ${accessToken.access_token}`,
  });
}

export function apiStateUpdateCallback() {
  const apiType = useApiTypeStore.getState().apiType;

  const accessTokenVal = useAccessTokenStore.getState().accessToken;

  if (!apiType || apiType !== ApiType.Strava) {
    useStravaClientStore.getState().setClient(null);
    return;
  }

  useStravaClientStore.getState().setClient(createClient(apiType, accessTokenVal ?? undefined));
}

export async function syncAccessToken(): Promise<Result<null, string>> {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return { success: false, error: "User not authenticated" };
  }

  const currentAccessToken = useAccessTokenStore.getState().accessToken;

  if (!accessTokenIsStale(currentAccessToken)) {
    return { success: true, value: null };
  }

  useAccessTokenStore.getState().setAccessToken(null);

  const result = await exchangeRefreshToken();

  await rehydrateAccessToken();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, value: null };
}
