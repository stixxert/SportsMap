import { useAuthenticatedState } from "@/lib/auth/authenticate";
import { useStravaClient, useApiType } from "@/lib/auth/api-store";
import type { AthleteProfile } from "@/lib/strava/types";
import useSWR, { Fetcher } from "swr";
import { ApiType } from "@/lib/auth/api-types";

export type ProfileState = {
  user: AthleteProfile;
  error: unknown;
  profileUsable: boolean;
};

export function useProfile(): ProfileState {
  const authenticated = useAuthenticatedState();
  const apiType = useApiType();
  const client = useStravaClient();

  const fetcher: Fetcher<AthleteProfile, string> = () =>
    client!.getAthlete();

  const profileUsable = apiType === ApiType.Strava;

  const profileKey = authenticated && client && profileUsable ? "athlete" : null;

  const { data, error } = useSWR(profileKey, fetcher, {
    revalidateOnFocus: false,
  });

  return { user: data as AthleteProfile, error, profileUsable };
}
