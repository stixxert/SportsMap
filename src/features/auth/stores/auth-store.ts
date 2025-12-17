"use client";

import * as zustand from "zustand";
import { AccessToken } from "@/src/types/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { createCookieStorage } from "@stores/persist-cookie";
import {
  ACCESS_TOKEN_COOKIE,
  IS_AUTHENTICATED_COOKIE,
} from "@config/cookie-settings";

interface AccessTokenState {
  accessToken: AccessToken | null;
  setAccessToken: (accessToken: AccessToken | null) => void;
}

interface AuthenticationState {
  authenticated: boolean | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
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

export const useAuthenticatedStore = zustand.create<AuthenticationState>()(
  persist(
    (set) => ({
      authenticated: null,
      setAuthenticated: (authenticated: boolean) => {
        set({ authenticated: authenticated });
      },
    }),
    {
      name: IS_AUTHENTICATED_COOKIE.key,
      storage: createJSONStorage(() =>
        createCookieStorage(IS_AUTHENTICATED_COOKIE.options),
      ),
    },
  ),
);

export const useAccessToken = () =>
  useAccessTokenStore((state) => state.accessToken);

export const useIsAuthenticated = () =>
  useAuthenticatedStore((state) => state.authenticated);

export const rehydrateAccessToken = () =>
  useAccessTokenStore.persist.rehydrate();

export const rehydrateIsAuthenticated = () =>
  useAuthenticatedStore.persist.rehydrate();
