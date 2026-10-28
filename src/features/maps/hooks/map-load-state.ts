import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useFilterProcessingResultsStatus } from "@/lib/filter/active-filter-store";

export function useMapLoadState() {
  const syncDone = useActivitySyncStore((state) => state.activitiesSync);

  const syncError = useActivitySyncStore((state) => state.syncError);

  const filterProcessingResultsReady = useFilterProcessingResultsStatus();

  const mapIndexReady = useSpatialIndexReadinessStore((state) => state.ready);

  // A failed sync must not look like an endless load: the UI needs to be able to say
  // so, and to offer a retry.
  if (syncError) return { ready: false, status: syncError, failed: true };

  if (!syncDone) return { ready: false, status: "Retrieving activities" };

  if (!filterProcessingResultsReady)
    return { ready: false, status: "Processing activity filter" };

  if (!mapIndexReady)
    return { ready: false, status: "Processing spatial index" };

  return { ready: true, failed: false };
}
