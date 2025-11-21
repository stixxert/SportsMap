"use client";

import { redirect, useSearchParams } from "next/navigation";
import { exchangeCodeForToken } from "@/src/app/authorize/lib/authorization";
import { useEffect } from "react";

export default function FromAuthorizationComponent() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams || !searchParams.has("code")) {
      return;
    }

    exchangeCodeForToken(searchParams.get("code") as string).then(() => {
      redirect("/");
    });
  }, [searchParams]);

  return <></>;
}
