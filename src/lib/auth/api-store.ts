import * as zustand from "zustand";
import type { StravaClient } from "@/lib/strava/client";
import { apiStateUpdateCallback } from "@/lib/auth/api-configuration";
import { useAccessTokenStore } from "@/lib/auth/auth-store";
import { ApiType } from "@/lib/auth/api-types";

interface ApiTypeState {
  apiType: ApiType | null;
  setApiType: (apiType: ApiType | null) => void;
}

interface StravaClientState {
  client: StravaClient | null;
  setClient: (client: StravaClient | null) => void;
}

export const useApiTypeStore = zustand.create<ApiTypeState>((set) => ({
  apiType: null,
  setApiType: (apiType: ApiType | null) => {
    set({ apiType: apiType });
  },
}));

export const useStravaClientStore = zustand.create<StravaClientState>((set) => ({
  client: null,
  setClient: (client: StravaClient | null) => set(() => ({ client })),
}));

export const useApiType = () => useApiTypeStore((state) => state.apiType);

export const useStravaClient = () =>
  useStravaClientStore((state) => state.client);

useApiTypeStore.subscribe((state, prevState) => {
  if (state.apiType !== prevState.apiType) {
    apiStateUpdateCallback();
  }
});

useAccessTokenStore.subscribe(() => {
  apiStateUpdateCallback();
});
