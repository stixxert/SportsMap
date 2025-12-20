"use client";

import {
  useApiConfigurationStore,
  useApiTypeStore,
} from "@/features/auth/stores/api-store";
import { useEffect } from "react";
import { synchronizeActivities } from "@/features/activity/lib/activity-sync";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";

export function useActivitySynchronization() {
  const apiConfiguration = useApiConfigurationStore(
    (state) => state.configuration,
  );

  const syncMetaData = useActivityMetadataStore((state) => state.metaData);

  useEffect(() => {
    const apiType = useApiTypeStore.getState().apiType;

    if (!apiType || !apiConfiguration || !syncMetaData) {
      return;
    }

    const isSynced = useActivitySyncStore.getState().activitiesSync;

    if (isSynced) return;

    setTimeout(() => synchronizeActivities(apiType, apiConfiguration));
  }, [apiConfiguration, syncMetaData]);
}
