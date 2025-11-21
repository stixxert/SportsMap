import { getCookie } from "cookies-next/client";
import { SummaryAthlete } from "@/strava-api";
import { ATHLETE_INFO_COOKIE } from "@utils/cookies";
import { Result } from "@utils/types";

export function getAthleteInfo(): Result<SummaryAthlete, string> {
  const athlete_info = getCookie(
    ATHLETE_INFO_COOKIE.key,
    ATHLETE_INFO_COOKIE.options,
  );

  if (!athlete_info) {
    return { success: false, error: "no athlete info; are you logged in?" };
  }

  return { success: true, value: JSON.parse(athlete_info) };
}
