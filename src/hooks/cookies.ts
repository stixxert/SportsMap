"use client";

import { useGetCookie } from "cookies-next/client";
import { ACCESS_TOKEN_COOKIE } from "@config/cookie-settings";
import { AccessToken } from "@/src/types/types";

function useCookie<T>(name: string): T | null {
  const getCookie = useGetCookie();

  const cookie = getCookie(name);

  return cookie ? JSON.parse(cookie) : null;
}

export function useAccessTokenCookie(): AccessToken | null {
  return useCookie(ACCESS_TOKEN_COOKIE.key);
}
