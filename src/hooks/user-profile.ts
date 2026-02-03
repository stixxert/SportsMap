import { useAuthenticatedState } from "@/lib/auth/authenticate";
import { useApiConfiguration, useApiType } from "@/lib/auth/api-store";
import { AthletesApi, DetailedAthlete } from "@/strava-api";
import useSWR, { Fetcher } from "swr";
import { ApiType } from "@/lib/auth/api-types";

export type ProfileState = {
  user: DetailedAthlete;
  error: unknown;
  profileUsable: boolean;
};

export function useProfile(): ProfileState {
  const authenticated = useAuthenticatedState();
  const apiType = useApiType();
  const apiConfiguration = useApiConfiguration();

  const athletesApi = new AthletesApi(
    apiType === ApiType.Strava ? apiConfiguration || undefined : undefined,
  );

  const fetcher: Fetcher<DetailedAthlete, string> = () =>
    athletesApi.getLoggedInAthlete();

  function constraintValid() {
    return Boolean(
      authenticated && apiType === ApiType.Strava && apiConfiguration,
    );
  }

  const { data, isLoading, isValidating, error } = useSWR(
    constraintValid() ? "true" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const profileUsable = apiType === ApiType.Strava; // || isLoading || isValidating || Boolean(data);

  return { user: data as DetailedAthlete, error, profileUsable };
}
