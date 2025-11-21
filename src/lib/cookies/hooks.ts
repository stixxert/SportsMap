"use client";

import { useGetCookie } from "cookies-next/client";
import { ACCESS_TOKEN_COOKIE, ATHLETE_INFO_COOKIE } from "@lib/cookies/options";
import { SummaryAthlete } from "@/strava-api";
import { useState } from "react";
import { AccessToken } from "@utils/types";

export function useAthleteInfoCookie(): SummaryAthlete | undefined {
  const [athleteInfo, setAthleteInfo] = useState<SummaryAthlete | undefined>(
    undefined,
  );

  const getCookie = useGetCookie();

  const cookie = getCookie(ATHLETE_INFO_COOKIE.key);

  if (!cookie) {
    setAthleteInfo(undefined);
  } else {
    const athleteInfo = JSON.parse(cookie);

    setAthleteInfo(athleteInfo);
  }

  return athleteInfo;
}

export function useAccessTokenCookie(): AccessToken | undefined {
  //const [accessToken, setAccessToken] = useState<AccessToken | undefined>(undefined);

  const getCookie = useGetCookie();

  const cookie = getCookie(ACCESS_TOKEN_COOKIE.key);

  if (cookie) return JSON.parse(cookie);

  return undefined;
}
