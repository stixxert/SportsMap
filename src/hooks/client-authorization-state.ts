"use client";

import {
  useAccessTokenStore,
  useAthleteInfoStore,
} from "@stores/authorization-store";
import {
  useAccessTokenCookie,
  useAthleteInfoCookie,
} from "@/src/hooks/client-cookies";
import { useEffect } from "react";
export function useAuthorizationCookies() {
  const setAthleteInfo = useAthleteInfoStore((state) => state.setAthleteInfo);

  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  const athleteInfo = useAthleteInfoCookie();

  const accessToken = useAccessTokenCookie();

  useEffect(() => {
    setAthleteInfo(athleteInfo);

    setAccessToken(accessToken);
  }, [setAthleteInfo, athleteInfo, setAccessToken, accessToken]);
}
