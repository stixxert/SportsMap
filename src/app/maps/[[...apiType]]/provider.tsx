"use client";

import React from "react";
import {
  useActivitySynchronization,
  useActivitySyncStoreOnTeardown,
} from "@features/activity/hooks/activity-state";
import {
  useEnsureActiveAccessToken,
  useSyncApiTypeToParams,
} from "@features/auth/hooks/authorization-hooks";

export default function ApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSyncApiTypeToParams();
  useEnsureActiveAccessToken();
  useActivitySynchronization();
  return <>{children}</>;
}
