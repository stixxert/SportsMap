import { ApiType } from "@/src/types/configuration-types";
import * as zustand from "zustand";
import { SyncMetaData } from "@features/activity/types/activity-types";
import { useApiTypeStore } from "@features/auth/stores/api-store";
import {
  exportMetaData,
  importMetaData,
} from "@features/activity/lib/activity-metadata";

export interface SyncMetaDataState {
  metaData: SyncMetaData | null;
  apiType: ApiType | null;
}

interface SyncMetaDataActions {
  setAll: (syncMetaData: SyncMetaDataState) => void;
  setMetaData: (metaData: SyncMetaData) => void;
}

interface SyncMetaDataStore extends SyncMetaDataState, SyncMetaDataActions {}

export const useActivityMetadataStore = zustand.create<SyncMetaDataStore>(
  (set) => ({
    metaData: null,
    apiType: null,
    setAll: (syncMetaData: SyncMetaDataState) => set(syncMetaData),
    setMetaData: (metaData: SyncMetaData) =>
      set({
        metaData: metaData,
      }),
  }),
);

useActivityMetadataStore.subscribe(
  (
    { apiType: newApiType, metaData: newMetaData },
    { apiType: prevApiType, metaData: prevMetaData },
  ) => {
    setTimeout(() =>
      exportMetaData(newApiType, newMetaData, prevApiType, prevMetaData),
    );
  },
);

useApiTypeStore.subscribe(
  ({ apiType: newApiType }, { apiType: prevApiType }) => {
    setTimeout(() => importMetaData(newApiType, prevApiType));
  },
);
