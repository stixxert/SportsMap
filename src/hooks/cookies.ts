"use client";

import { useGetCookie } from "cookies-next/client";
import {
  ACCESS_TOKEN_COOKIE,
  ATHLETE_INFO_COOKIE,
} from "@config/cookie-settings";
import { SummaryAthlete } from "@/strava-api";
import { AccessToken } from "@/src/types/types";

function useCookie<T>(name: string): T | null {
  const getCookie = useGetCookie();

  const cookie = getCookie(name);

  return cookie ? JSON.parse(cookie) : null;
}

export function useAthleteInfoCookie(): SummaryAthlete | null {
  return useCookie(ATHLETE_INFO_COOKIE.key);
}

export function useAccessTokenCookie(): AccessToken | null {
  return useCookie(ACCESS_TOKEN_COOKIE.key);
}
