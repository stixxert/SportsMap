import {
  useApiConfiguration,
  useApiType,
} from "@/features/auth/stores/api-store";
import { AthletesApi, DetailedAthlete } from "@/strava-api";
import { ApiType } from "@/types/configuration-types";
import useSWR, { Fetcher } from "swr";
import { useAuthenticatedState } from "@/features/auth/hooks/authorization-hooks";

export function useProfile() {
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

  const { data, error } = useSWR(constraintValid() ? "true" : null, fetcher);

  return { user: data as DetailedAthlete, error };
}
