"use client";

import React from "react";
import { useActivitySynchronization } from "@/features/activity/hooks/sync-state";
import {
  useAccessTokenSync,
  useSyncApiTypeToParams,
} from "@/features/auth/hooks/authorization-hooks";
import {
  useActivityCategorizationQuerySync,
  useMetaDataSync,
} from "@/features/activity/hooks/window-dependent-subscribes";
import { useInteractionDependencies } from "@/features/maps/hooks/use-map-interaction";
import { useProfile } from "@/features/profile/hooks/use-profile";

export default function ApiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useProfile();
  useInteractionDependencies();

  useMetaDataSync();
  useSyncApiTypeToParams();
  useAccessTokenSync();
  useActivitySynchronization();

  useActivityCategorizationQuerySync();

  return <>{children}</>;
}
