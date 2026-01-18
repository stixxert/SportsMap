"use client";

import {
  useApiConfigurationStore,
  useApiTypeStore,
} from "@/features/auth/stores/api-store";
import { useEffect } from "react";
import { synchronizeActivities } from "@/features/activity/lib/sync/activity-sync";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";

/* needs sync using hook, as localstorage of metadata requires a reference to the client browser */
export function useActivitySynchronization() {
  const syncMetaData = useActivityMetadataStore((state) => state.metaData);

  useEffect(() => {
    const apiConfiguration = useApiConfigurationStore.getState().configuration;
    const apiType = useApiTypeStore.getState().apiType;

    if (!apiType || !apiConfiguration || !syncMetaData) {
      return;
    }

    const isSynced = useActivitySyncStore.getState().activitiesSync;

    if (isSynced != null) return;

    useActivitySyncStore.getState().setActivitiesSync(false);

    void synchronizeActivities(apiType, apiConfiguration);
  }, [syncMetaData]);
}
