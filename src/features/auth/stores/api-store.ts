import * as zustand from "zustand";
import { Configuration } from "@/strava-api";
import { ApiType } from "@/src/types/configuration-types";
import { apiStateUpdateCallback } from "@/features/auth/lib/api-configuration";
import { useAccessTokenStore } from "@/features/auth/stores/auth-store";

interface ApiTypeState {
  apiType: ApiType | null;
  setApiType: (apiType: ApiType | null) => void;
}

interface ApiConfigurationState {
  configuration: Configuration | null;
  setConfiguration: (configuration: Configuration | null) => void;
}

export const useApiTypeStore = zustand.create<ApiTypeState>((set) => ({
  apiType: null,
  setApiType: (apiType: ApiType | null) => {
    set({ apiType: apiType });
  },
}));

export const useApiConfigurationStore = zustand.create<ApiConfigurationState>(
  (set) => ({
    configuration: null,
    setConfiguration: (configuration: Configuration | null) =>
      set(() => ({
        configuration: configuration,
      })),
  }),
);

export const useApiType = () => useApiTypeStore((state) => state.apiType);

export const useApiConfiguration = () =>
  useApiConfigurationStore((state) => state.configuration);

useApiTypeStore.subscribe((state, prevState) => {
  if (state.apiType !== prevState.apiType) {
    apiStateUpdateCallback();
  }
});

useAccessTokenStore.subscribe(() => {
  apiStateUpdateCallback();
});
