"use server";

import { Result } from "@/types/types";
import {
  deleteRefreshTokenCookie,
  getRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/server-cookies";
import { OAUTH_RETRIEVE_TOKEN_URL } from "@/config/api-urls";
import { assembleUrl } from "@/utils/url";

/** Strava token endpoints get a hard deadline: a hung upstream must not hang the app. */
const TOKEN_REQUEST_TIMEOUT_MS = 10_000;

type TokenResponse = {
  token_type?: string;
  access_token?: string;
  expires_at?: number;
  expires_in?: number;
  refresh_token?: string;
};

/**
 * Reads a token response defensively.
 *
 * Strava answers some failures with a non-JSON body, so `response.json()` can throw. The
 * previous code concatenated the parsed body into an error string, which produced
 * "[object Object]" and could have leaked upstream detail into the UI.
 */
async function readTokenResponse(response: Response) {
  if (!response.ok) {
    return { ok: false as const, reason: `HTTP ${response.status}` };
  }

  let body: TokenResponse;

  try {
    body = (await response.json()) as TokenResponse;
  } catch {
    return { ok: false as const, reason: "malformed token response" };
  }

  const { token_type, access_token, expires_at, expires_in, refresh_token } =
    body;

  if (!token_type || !access_token || !expires_at || !expires_in) {
    return { ok: false as const, reason: "incomplete token response" };
  }

  return {
    ok: true as const,
    token: { token_type, access_token, expires_at, expires_in },
    refreshToken: refresh_token,
  };
}

export async function exchangeCodeForToken(
  code: string,
): Promise<Result<void, string>> {
  const url = assembleUrl(OAUTH_RETRIEVE_TOKEN_URL, {
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    code: code,
    grant_type: "authorization_code",
  });

  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
  });

  const parsed = await readTokenResponse(response);

  if (!parsed.ok) {
    return {
      success: false,
      error: `Error while requesting token: ${parsed.reason}`,
    };
  }

  if (!parsed.refreshToken) {
    return { success: false, error: "Error while requesting token: missing refresh token" };
  }

  await Promise.all([
    setRefreshTokenCookie(parsed.refreshToken),
    setAccessTokenCookie(parsed.token),
  ]);

  return { success: true, value: undefined };
}

export async function exchangeRefreshToken(): Promise<Result<void, string>> {
  const refresh_token = await getRefreshTokenCookie();

  if (!refresh_token)
    return { success: false, error: "Refresh token not found" };

  const url = assembleUrl(OAUTH_RETRIEVE_TOKEN_URL, {
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  });

  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
  });

  const parsed = await readTokenResponse(response);

  if (!parsed.ok) {
    return {
      success: false,
      error: `Error while refreshing access token: ${parsed.reason}`,
    };
  }

  if (!parsed.refreshToken) {
    return { success: false, error: "Error while refreshing token: missing refresh token" };
  }

  await Promise.all([
    setRefreshTokenCookie(parsed.refreshToken),
    setAccessTokenCookie(parsed.token),
  ]);

  return { success: true, value: undefined };
}

export async function deleteServerOnlyTokens(): Promise<void> {
  return deleteRefreshTokenCookie();
}

export async function isAuthenticated(): Promise<boolean> {
  const refresh_token = await getRefreshTokenCookie();

  return refresh_token !== undefined;
}
