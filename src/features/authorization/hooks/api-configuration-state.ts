"use client";

import { ApiConfigurationType } from "@/src/types/configuration-types";
import { useAccessTokenStore } from "@stores/authorization-store";
import { useApiConfigurationStore } from "@features/authorization/api-configuration-store";
import { Configuration } from "@/strava-api";
import { useEffect } from "react";

export function useSetApiConfiguration(mode: string) {
  const modeUppercase = mode.toUpperCase();

  let configurationType = ApiConfigurationType.Demo;

  if (modeUppercase === ApiConfigurationType.Strava) {
    configurationType = ApiConfigurationType.Strava;
  } else if (modeUppercase === ApiConfigurationType.Demo) {
    configurationType = ApiConfigurationType.Demo;
  }

  useUpdateApiConfiguration(configurationType);
}

export function useUpdateApiConfiguration(
  configurationType: ApiConfigurationType,
) {
  const accessToken = useAccessTokenStore((state) => state.accessToken);

  const setApiConfiguration = useApiConfigurationStore(
    (state) => state.setConfiguration,
  );

  useEffect(() => {
    if (configurationType === ApiConfigurationType.Strava) {
      if (!accessToken) {
        setApiConfiguration(null);
      } else {
        setApiConfiguration(
          new Configuration({
            accessToken: `${accessToken.token_type} ${accessToken.access_token}`,
          }),
        );
      }
    } else if (configurationType === ApiConfigurationType.Demo) {
      setApiConfiguration(
        new Configuration({
          basePath: `${process.env.NEXT_PUBLIC_DOMAIN}/api/demo`,
        }),
      );
    }
  }, [configurationType, accessToken, setApiConfiguration]);
}
