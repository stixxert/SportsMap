"use client";

import React from "react";
import { useActivitySynchronization } from "@features/activity/hooks/sync-state";
import {
  useEnsureActiveAccessToken,
  useSyncApiTypeToParams,
} from "@features/auth/hooks/authorization-hooks";
import {
  useActivityCategorizationQuerySync,
  useMetaDataSync,
} from "@features/activity/hooks/window-dependent-subscribes";

export default function ApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useMetaDataSync();
  useSyncApiTypeToParams();
  useEnsureActiveAccessToken();
  useActivitySynchronization();

  useActivityCategorizationQuerySync();

  return <>{children}</>;
}
