"use client";

import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import {
  exchangeCodeForToken,
  isAuthenticated,
} from "@/lib/auth/server-exchange";
import { AUTHORIZE_URL } from "@/lib/auth/config";
import {
  syncAccessToken,
  readApiTypeString,
} from "@/lib/auth/api-configuration";
import { useApiTypeStore } from "@/lib/auth/api-store";
import { rehydrateAccessToken } from "@/lib/auth/auth-store";
import { ApiType } from "@/lib/auth/api-types";

export function useAuthorizationFlow() {
  const searchParams = useSearchParams();

  const router = useRouter();

  useEffect(() => {
    if (!searchParams || !searchParams.has("code")) {
      redirect(AUTHORIZE_URL);
    }

    const code = searchParams.get("code") as string;

    async function codeExchange(code: string) {
      const result = await exchangeCodeForToken(code);

      if (result.success) {
      } else {
        // TODO: Toast
      }
      router.push("/");
    }

    codeExchange(code).then(() => rehydrateAccessToken());
  });
}

export function useAuthenticatedState() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function updateAuthenticatedState() {
      const state = await isAuthenticated();

      setAuthenticated(state);
    }

    void updateAuthenticatedState();
  }, []);

  return authenticated;
}

export function useAccessTokenSync() {
  const authenticated = useAuthenticatedState();

  useEffect(() => {
    if (!authenticated) return;

    void syncAccessToken();
  }, [authenticated]);

  return authenticated;
}

export function useSyncApiTypeToParams() {
  const { apiType } = useParams<{ apiType: string[] | undefined }>();

  const apiTypeSlug = apiType ? apiType[0] : undefined;

  const castType = readApiTypeString(apiTypeSlug || "") || ApiType.Strava;

  useEffect(() => {
    if (castType === useApiTypeStore.getState().apiType) return;

    useApiTypeStore.getState().setApiType(castType);
  }, [castType]);
}
