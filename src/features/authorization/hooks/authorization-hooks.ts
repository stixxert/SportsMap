"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { exchangeCodeForToken } from "@features/authorization/lib/server-flow";
import { AUTHORIZE_URL } from "@features/authorization/lib/objects";

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
