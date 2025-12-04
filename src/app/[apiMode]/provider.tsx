"use client";

import React, { useEffect } from "react";
import { useAuthorizationCookies } from "@/src/hooks/authorization-state";
import { useStoredActivities } from "@/src/hooks/activity-db-state";
import { useParams } from "next/navigation";
import { useSetApiConfiguration } from "@features/authorization/hooks/api-configuration-state";

export default function ApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { apiMode } = useParams<{ apiMode: string }>();

  const mode = (apiMode || "") as string;

  useEffect(() => {
    console.log(`API mode: ${mode}`);
  }, [mode]);

  useSetApiConfiguration(mode);

  useAuthorizationCookies();

  return <>{children}</>;
}
