"use client";

import { AccessToken, Result } from "@/types/types";
import { Configuration, ErrorContext, Middleware } from "@/strava-api";
import {
  useApiConfigurationStore,
  useApiTypeStore,
} from "@/lib/auth/api-store";
import {
  rehydrateAccessToken,
  useAccessTokenStore,
} from "@/lib/auth/auth-store";
import {
  exchangeRefreshToken,
  isAuthenticated,
} from "@/lib/auth/server-exchange";
import { ApiType } from "@/lib/auth/api-types";
import { Logout } from "@/lib/auth/user-actions";

async function fetchErrorWrapper(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401) {
    throw new Error("Unauthorized", await response.json());
  }

  return response;
}

const errorFallbackMiddleware: Middleware = {
  onError: function (context: ErrorContext): Promise<Response | void> {
    if (context.error === "Unauthorized") void Logout();

    return Promise.resolve();
  },
};

export function readApiTypeString(apiType: string): ApiType | undefined {
  const modeUppercase = apiType.toUpperCase();

  if (modeUppercase === ApiType.Strava) {
    return ApiType.Strava;
  } else if (modeUppercase === ApiType.Demo) {
    return ApiType.Demo;
  }

  return undefined;
}

function createStravaApiConfiguration(accessToken: AccessToken) {
  return new Configuration({
    fetchApi: fetchErrorWrapper,
    middleware: [errorFallbackMiddleware],
    accessToken: `${accessToken.token_type} ${accessToken.access_token}`,
  });
}

function createDemoApiConfiguration() {
  return new Configuration({
    fetchApi: fetchErrorWrapper,
    middleware: [errorFallbackMiddleware],
    basePath: `${process.env.NEXT_PUBLIC_DOMAIN}/api/demo`,
  });
}

export function createConfiguration(
  apiType: ApiType,
  accessToken?: AccessToken,
): Configuration | null {
  if (apiType === ApiType.Strava) {
    if (!accessToken) {
      return null;
    }

    return createStravaApiConfiguration(accessToken);
  } else if (apiType === ApiType.Demo) {
    return createDemoApiConfiguration();
  }

  // TODO: How should this function return on invalid ApiType?
  return createDemoApiConfiguration();
}

export function apiStateUpdateCallback() {
  const apiType = useApiTypeStore.getState().apiType;

  const accessTokenVal = useAccessTokenStore.getState().accessToken;

  const accessToken =
    apiType === ApiType.Strava && accessTokenVal ? accessTokenVal : undefined;

  if (!apiType) {
    useApiConfigurationStore.getState().setConfiguration(null);
    return;
  }

  const newConfiguration = createConfiguration(apiType, accessToken);

  useApiConfigurationStore.getState().setConfiguration(newConfiguration);
}

export async function syncAccessToken(): Promise<Result<null, string>> {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return Promise.reject({
      success: false,
      reason: "User not authenticated",
    });
  }

  const currentAccessToken = useAccessTokenStore.getState().accessToken;

  let shouldRefresh = false;

  if (currentAccessToken) {
    /* mark token as expired if expiring within 10 minutes */
    const epochNow = Date.now() + 1000 * 60 * 10;

    if (epochNow < currentAccessToken.expires_at) {
      shouldRefresh = true;
    }
  } else {
    shouldRefresh = true;
  }

  if (shouldRefresh) {
    useAccessTokenStore.getState().setAccessToken(null);
    await exchangeRefreshToken();
    rehydrateAccessToken();
    return { success: true, value: null };
  }

  return Promise.resolve({ success: true, value: null });
}
