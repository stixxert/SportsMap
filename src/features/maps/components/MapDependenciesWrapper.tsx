import "@/features/registrations";

import { ReactNode } from "react";
import { useMapWorkers } from "@/features/maps/hooks/use-workers";
import { useAggregateWorkers } from "@/features/activity-aggregation";
import {
  useAccessTokenSync,
  useSyncApiTypeToParams,
} from "@/features/auth/hooks/authorization-hooks";
import { useActivityCategorizationQuerySync } from "@/features/activity/hooks/window-dependent-subscribes";
import { useActivityFiltering } from "@/features/activity-filter/hooks/use-activity-filtering";
import { useActivitySynchronization } from "@/features/activity/hooks/sync-state";
import MapLoadingState from "@/features/maps/components/overlay/MapLoadingState";
import * as React from "react";

export default function MapDependenciesWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useMapWorkers();
  useAggregateWorkers();
  useAccessTokenSync();
  useActivityCategorizationQuerySync();
  useSyncApiTypeToParams();

  useActivityFiltering();

  useActivitySynchronization();

  return (
    <>
      {children} <MapLoadingState />
    </>
  );
}
