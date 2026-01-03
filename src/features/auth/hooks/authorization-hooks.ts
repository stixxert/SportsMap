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
} from "@/features/auth/lib/server-flow";
import { AUTHORIZE_URL } from "@/features/auth/lib/objects";
import {
  syncAccessToken,
  readApiTypeString,
} from "@/features/auth/lib/api-configuration";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import { ApiType } from "@/types/configuration-types";

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

    codeExchange(code).then();
  });
}

/* not continuously refreshing, will only run on update of authenticated status (new refresh token) */
export function useAccessTokenSync() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function updateAuthenticatedState() {
      const state = await isAuthenticated();

      setAuthenticated(state);
    }

    void updateAuthenticatedState();
  }, []);

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

  if (castType === useApiTypeStore.getState().apiType) return;

  useApiTypeStore.getState().setApiType(castType);
}
