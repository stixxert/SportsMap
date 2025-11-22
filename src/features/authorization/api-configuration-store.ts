import * as zustand from "zustand";
import { Configuration } from "@/strava-api";

interface ApiConfigurationState {
  configuration: Configuration | null;
  setConfiguration: (configuration: Configuration | null) => void;
}

export const useApiConfigurationStore = zustand.create<ApiConfigurationState>(
  (set) => ({
    configuration: null,
    setConfiguration: (configuration: Configuration | null) =>
      set(() => ({
        configuration: configuration,
      })),
  }),
);
