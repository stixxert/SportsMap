"use client";

import { useApiType, useStravaClient } from "@/lib/auth/api-store";
import { useEffect } from "react";
import { synchronizeActivities } from "@/features/activity/lib/activity-sync";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";
import { ApiType } from "@/lib/auth/api-types";

/**
 * Runs the one-time activity sync.
 *
 * `client` is subscribed to (not read via `getState()`): at boot the metadata resolves
 * before the token refresh finishes, so a non-reactive read could see `null` and skip
 * the entire session's sync.
 *
 * A failed sync is caught and recorded. Previously it left `activitiesSync === false`
 * forever, so the "Retrieving activities" backdrop never closed and nothing retried.
 */
export function useActivitySynchronization() {
  const syncMetaData = useActivityMetadataStore((state) => state.metaData);

  const apiType = useApiType();

  const client = useStravaClient();

  const activitiesSync = useActivitySyncStore((state) => state.activitiesSync);

  useEffect(() => {
    if (!apiType || !syncMetaData) return;

    // Demo mode generates its activities locally and needs no client.
    if (apiType === ApiType.Strava && !client) return;

    // Already running or finished; a retry resets this to null (see MapLoadingState).
    if (activitiesSync !== null) return;

    const store = useActivitySyncStore.getState();

    store.setActivitiesSync(false);
    store.setSyncError(null);

    void synchronizeActivities(apiType, client)
      .then(() => store.setSyncError(null))
      .catch((error: unknown) => {
        console.error("Activity synchronization failed", error);

        useActivitySyncStore
          .getState()
          .setSyncError(
            error instanceof Error ? error.message : "Unknown sync error",
          );
      });
  }, [apiType, client, syncMetaData, activitiesSync]);
}
