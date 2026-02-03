import "@/features/registrations";

import { ReactNode } from "react";
import { useMapWorkers } from "@/features/maps/hooks/use-workers";
import {
  useAccessTokenSync,
  useSyncApiTypeToParams,
} from "@/lib/auth/authenticate";
import { useActivityFiltering } from "@/lib/filter/use-activity-filtering";
import { useActivitySynchronization } from "@/features/activity/hooks/sync-state";
import MapLoadingState from "@/features/maps/components/overlay/MapLoadingState";
import * as React from "react";
import { useAggregateWorkers } from "@/features/activity-aggregation/hooks/use-workers";
import { useAggregateDispatcher } from "@/features/activity-aggregation/hooks/use-aggregate";

export default function MapDependenciesWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useMapWorkers();
  useAggregateWorkers();

  useAccessTokenSync();
  useSyncApiTypeToParams();

  const performAggregate = useAggregateDispatcher();

  useActivityFiltering(performAggregate);

  useActivitySynchronization();
  return (
    <>
      {children} <MapLoadingState />
    </>
  );
}
