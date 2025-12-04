import * as zustand from "zustand";
import { Configuration } from "@/strava-api";
import { ApiConfigurationType } from "@/src/types/configuration-types";

interface ApiConfigurationState {
  configuration: Configuration | null;
  apiType: ApiConfigurationType;
  setConfiguration: (configuration: Configuration | null) => void;
}

export const useApiConfigurationStore = zustand.create<ApiConfigurationState>(
  (set) => ({
    configuration: null,
    apiType: ApiConfigurationType.Demo,
    setConfigurationMode: (apiType: ApiConfigurationType) =>
      set(() => ({
        apiType: apiType,
      })),
    setConfiguration: (configuration: Configuration | null) =>
      set(() => ({
        configuration: configuration,
      })),
  }),
);
