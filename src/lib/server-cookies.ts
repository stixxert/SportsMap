"use server";

import { AccessToken } from "@/types/types";
import { CookieValueTypes, getCookie, setCookie } from "cookies-next/server";
import {
  ACCESS_TOKEN_COOKIE,
  IS_AUTHENTICATED_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/config/cookie-settings";
import { cookies } from "next/headers";

export async function setRefreshTokenCookie(
  refreshToken: string,
): Promise<void[]> {
  return Promise.all([
    setCookie(REFRESH_TOKEN_COOKIE.key, JSON.stringify(refreshToken), {
      ...REFRESH_TOKEN_COOKIE.options,
      cookies,
    }),
    setCookie(
      IS_AUTHENTICATED_COOKIE.key,
      JSON.stringify({ authenticated: true }),
      { ...IS_AUTHENTICATED_COOKIE.options, cookies },
    ),
  ]);
}

export async function setAccessTokenCookie(
  accessToken: AccessToken,
): Promise<void> {
  return setCookie(ACCESS_TOKEN_COOKIE.key, JSON.stringify({ accessToken }), {
    ...ACCESS_TOKEN_COOKIE.options,
    cookies,
  });
}

export async function getRefreshTokenCookie(): Promise<CookieValueTypes> {
  const cookie = await getCookie(REFRESH_TOKEN_COOKIE.key, {
    ...REFRESH_TOKEN_COOKIE.options,
    cookies,
  });

  if (!cookie) {
    return cookie;
  }

  return JSON.parse(cookie);
}
