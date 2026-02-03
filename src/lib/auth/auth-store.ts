"use client";

import * as zustand from "zustand";
import { AccessToken } from "@/types/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { createCookieStorage } from "@/stores/persist-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/config/cookie-settings";

interface AccessTokenState {
  accessToken: AccessToken | null;
  setAccessToken: (accessToken: AccessToken | null) => void;
}

/* https://github.com/pmndrs/zustand/discussions/1716 */
export const useAccessTokenStore = zustand.create<AccessTokenState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken: AccessToken | null) => {
        set({ accessToken: accessToken });
      },
    }),
    {
      name: ACCESS_TOKEN_COOKIE.key,
      storage: createJSONStorage(() =>
        createCookieStorage(ACCESS_TOKEN_COOKIE.options),
      ),
    },
  ),
);

export const useAccessToken = () =>
  useAccessTokenStore((state) => state.accessToken);

export const rehydrateAccessToken = () =>
  useAccessTokenStore.persist.rehydrate();
