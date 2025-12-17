"use client";

import { ApiType } from "@/src/types/configuration-types";
import { del, get, openKVDB, set } from "@lib/kv-db";
import { SyncMetaData } from "@features/activity/types/activity-types";
import { useApiTypeStore } from "@features/auth/stores/api-store";
import {
  SyncMetaDataState,
  useActivityMetadataStore,
} from "@features/activity/stores/activity-metadata-store";

const METADATA_KEY = "SYNC_METADATA_";

export async function getMetaData(
  apiType: ApiType,
): Promise<SyncMetaData | null> {
  const db = await openKVDB();

  const metaDataKey = `${METADATA_KEY}${apiType}`;

  const value = await get(db, metaDataKey);

  return value ? JSON.parse(value as string) : null;
}

export async function setMetaData(
  apiType: ApiType,
  value: SyncMetaData | null,
): Promise<void> {
  const db = await openKVDB();

  const metaDataKey = `${METADATA_KEY}${apiType}`;

  if (value === null) {
    return del(db, metaDataKey);
  }

  return set(db, metaDataKey, JSON.stringify(value)).then();
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

  if (newApiType) newMetaData.metaData = await getMetaData(newApiType);

  if (!newMetaData.metaData)
    newMetaData.metaData = { athleteId: undefined, lastSync: new Date(0) };

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
      await setMetaData(prevApiType, prevMetaData);
    }

    /* export new metadata */
    if (newApiType !== null && newMetaData !== null) {
      await setMetaData(newApiType, newMetaData);
    }
  } else {
    /* export new metadata, where new/prev ApiTypes match, but metadata is updated */
    if (
      newApiType !== null &&
      newMetaData !== null &&
      newMetaData !== prevMetaData
    ) {
      await setMetaData(newApiType, newMetaData);
    }
  }
}
