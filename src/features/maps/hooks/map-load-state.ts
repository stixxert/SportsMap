import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useFilterProcessingResultsStatus } from "@/lib/filter/active-filter-store";

export function useMapLoadState() {
  const syncDone = useActivitySyncStore((state) => state.activitiesSync);

  const filterProcessingResultsReady = useFilterProcessingResultsStatus();

  const mapIndexReady = useSpatialIndexReadinessStore((state) => state.ready);

  if (!syncDone) return { ready: false, status: "Retrieving activities" };

  if (!filterProcessingResultsReady)
    return { ready: false, status: "Processing activity filter" };

  if (!mapIndexReady)
    return { ready: false, status: "Processing spatial index" };

  return { ready: true };
}
