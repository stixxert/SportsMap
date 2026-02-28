"use server";

import { Result } from "@/types/types";
import { URL } from "url";
import {
  deleteRefreshTokenCookie,
  getRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/server-cookies";
import { OAUTH_RETRIEVE_TOKEN_URL } from "@/config/api-urls";

export async function exchangeCodeForToken(
  code: string,
): Promise<Result<void, string>> {
  const query = new URL(OAUTH_RETRIEVE_TOKEN_URL);

  Object.entries({
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    code: code,
    grant_type: "authorization_code",
  }).forEach(([key, value]) => {
    query.searchParams.append(key, value);
  });

  const response = await fetch(query, {
    method: "POST",
  });

  if (!response.ok)
    return {
      success: false,
      error: "Error while requesting token: "
        .concat(response.statusText)
        .concat(await response.json()),
    };

  const response_body = await response.json();

  const { refresh_token } = response_body;

  if (!refresh_token)
    return {
      success: false,
      error: "Error while refreshing token: ".concat("Missing refresh token"),
    };

  const { token_type, access_token, expires_at, expires_in } = response_body;

  if (!token_type || !access_token || !expires_at || !expires_in)
    return {
      success: false,
      error: "Error while requesting token: ".concat("Missing access token"),
    };

  /*
   * Set client cookies based on refresh and access token.
   */

  await Promise.all([
    setRefreshTokenCookie(refresh_token),
    setAccessTokenCookie({ token_type, access_token, expires_at, expires_in }),
  ]);

  return { success: true, value: undefined };
}

export async function exchangeRefreshToken(): Promise<Result<void, string>> {
  const refresh_token = await getRefreshTokenCookie();

  if (!refresh_token)
    return { success: false, error: "Refresh token not found" };

  const query = new URL(OAUTH_RETRIEVE_TOKEN_URL);

  Object.entries({
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  }).forEach(([key, value]) => {
    query.searchParams.append(key, value);
  });

  const response = await fetch(query, {
    method: "POST",
  });

  if (!response.ok)
    return {
      success: false,
      error: "Error while refreshing access token: ".concat(
        response.statusText,
      ),
    };

  const response_body = await response.json();

  const refresh_token_new = response_body.refresh_token;

  if (!refresh_token_new)
    return {
      success: false,
      error: "Error while refreshing token: ".concat("Missing refresh token"),
    };

  const { token_type, access_token, expires_at, expires_in } = response_body;

  if (!token_type || !access_token || !expires_at || !expires_in)
    return {
      success: false,
      error: "Error while refreshing token: ".concat("Missing access token"),
    };

  await Promise.all([
    setRefreshTokenCookie(refresh_token_new),
    setAccessTokenCookie({ token_type, access_token, expires_at, expires_in }),
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
