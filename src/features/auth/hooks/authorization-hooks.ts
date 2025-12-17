"use client";

import {
  redirect,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect } from "react";
import { exchangeCodeForToken } from "@features/auth/lib/server-flow";
import { AUTHORIZE_URL } from "@features/auth/lib/objects";
import { useAuthenticatedStore } from "@features/auth/stores/auth-store";
import {
  ensureAccessToken,
  readApiTypeString,
} from "@features/auth/lib/api-configuration";
import { useApiTypeStore } from "@features/auth/stores/api-store";
import { ApiType } from "@/src/types/configuration-types";

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
export function useEnsureActiveAccessToken() {
  /* side-effect of reliance on completed authenticated state: will run again when new refresh token is returned with new access token.*/
  const authenticated = useAuthenticatedStore((state) => state.authenticated);

  useEffect(() => {
    ensureAccessToken();
  }, [authenticated]);
}

export function useSyncApiTypeToParams() {
  const { apiType } = useParams<{ apiType: string[] | undefined }>();

  const apiTypeSlug = apiType ? apiType[0] : undefined;

  const castType = readApiTypeString(apiTypeSlug || "") || ApiType.Strava;

  if (castType === useApiTypeStore.getState().apiType) return;

  useApiTypeStore.getState().setApiType(castType);
}
