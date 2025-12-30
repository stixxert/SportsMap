"use client";

import React from "react";
import { useActivitySynchronization } from "@/features/activity/hooks/sync-state";
import {
  useEnsureActiveAccessToken,
  useSyncApiTypeToParams,
} from "@/features/auth/hooks/authorization-hooks";
import {
  useActivityCategorizationQuerySync,
  useMetaDataSync,
} from "@/features/activity/hooks/window-dependent-subscribes";
import { useInteractionDependencies } from "@/features/maps/hooks/use-map-interaction";

export default function ApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useInteractionDependencies();

  useMetaDataSync();
  useSyncApiTypeToParams();
  useEnsureActiveAccessToken();
  useActivitySynchronization();

  useActivityCategorizationQuerySync();

  return <>{children}</>;
}
