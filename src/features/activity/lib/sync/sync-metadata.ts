"use client";

import { ApiType } from "@/src/types/configuration-types";
import {
  SyncMetaDataState,
  useActivityMetadataStore,
} from "@/features/activity/stores/activity-metadata-store";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import {
  getMetaData,
  openActivityDatabase,
  setMetaData,
} from "@/lib/db/origin-related-activity-db";
import { SummaryAthlete } from "@/strava-api";

const SYNC_KEY_NAME = "sync";

export type SyncMetaData = {
  athleteId: NonNullable<SummaryAthlete["id"]>;
  lastSync: Date;
};

async function getSyncMetaData<T>(originType: ApiType) {
  const db = await openActivityDatabase(originType);
  return getMetaData<T>(db, SYNC_KEY_NAME);
}

async function setSyncMetaData<T>(
  originType: ApiType,
  value: T,
): Promise<void> {
  const db = await openActivityDatabase(originType);
  return setMetaData(db, SYNC_KEY_NAME, value);
}

/* import based on new dependencies (ApiType) */
export async function importMetaData(
  newApiType: ApiType | null,
  prevApiType: ApiType | null,
) {
  if (newApiType === null || newApiType === prevApiType) {
    return;
  }

  const newMetaData: SyncMetaDataState = {
    apiType: newApiType ? newApiType : null,
    metaData: null,
  };

  if (newApiType)
    newMetaData.metaData =
      (await getSyncMetaData<SyncMetaData>(newApiType)) ?? null;

  if (!newMetaData.metaData)
    newMetaData.metaData = { athleteId: 0, lastSync: new Date(0) };

  useActivityMetadataStore.getState().setAll(newMetaData);
}

/* subscribe to updates, export previous MetaData state */
export async function exportMetaData(
  newApiType: ApiType | null,
  newMetaData: SyncMetaData | null,
  prevApiType: ApiType | null,
  prevMetaData: SyncMetaData | null,
) {
  if (newApiType !== prevApiType) {
    /* export previous metadata */
    if (prevApiType !== null && prevMetaData !== null) {
      await setSyncMetaData(prevApiType, prevMetaData);
    }

    /* export new metadata */
    if (newApiType !== null && newMetaData !== null) {
      await setSyncMetaData(newApiType, newMetaData);
    }
  } else {
    /* export new metadata, where new/prev ApiTypes match, but metadata is updated */
    if (
      newApiType !== null &&
      newMetaData !== null &&
      newMetaData !== prevMetaData
    ) {
      await setSyncMetaData(newApiType, newMetaData);
    }
  }
}

useApiTypeStore.subscribe(
  async ({ apiType: newApiType }, { apiType: prevApiType }) =>
    void importMetaData(newApiType, prevApiType),
);

useActivityMetadataStore.subscribe(
  async (
    { apiType: newApiType, metaData: newMetaData },
    { apiType: prevApiType, metaData: prevMetaData },
  ) => void exportMetaData(newApiType, newMetaData, prevApiType, prevMetaData),
);
