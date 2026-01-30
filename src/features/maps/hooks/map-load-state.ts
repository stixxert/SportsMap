import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";
import { useFilterAggregationProcessingStatus } from "@/features/activity-filter/stores/active-filter-store";

export interface ReadyState {
  ready: boolean;
  status?: string;
}

export function useMapLoadState() {
  const syncDone = useActivitySyncStore((state) => state.activitiesSync);

  const filterProcessing = useFilterAggregationProcessingStatus();

  const mapIndexReady = useSpatialIndexReadinessStore((state) => state.ready);

  if (!syncDone) return { ready: false, status: "Retrieving activities" };

  if (filterProcessing)
    return { ready: false, status: "Processing activity filter" };

  if (!mapIndexReady)
    return { ready: false, status: "Processing spatial index" };

  return { ready: true };
}
