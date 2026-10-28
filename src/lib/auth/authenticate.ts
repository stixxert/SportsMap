"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

/**
 * OAuth callback handler.
 *
 * Previously: an effect with no dependency array (so it re-ran on every render and could
 * exchange the same single-use code repeatedly), `redirect()` called mid-render, and no
 * `return` after redirecting so execution continued into the exchange.
 */
export function useAuthorizationFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    const code = searchParams?.get("code");

    if (!code) {
      window.location.assign(AUTHORIZE_URL);
      return;
    }

    // Guard against React's development re-mounts re-submitting a single-use code.
    if (started.current) return;
    started.current = true;

    void (async () => {
      const result = await exchangeCodeForToken(code);

      if (!result.success) {
        console.error("Strava authorization failed", result.error);
        window.location.assign(AUTHORIZE_URL);
        return;
      }

      await rehydrateAccessToken();
      router.replace("/");
    })();
  }, [searchParams, router]);
}

export function useAuthenticatedState() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    void isAuthenticated().then((state) => {
      if (!cancelled) setAuthenticated(state);
    });

    return () => {
      cancelled = true;
    };
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
