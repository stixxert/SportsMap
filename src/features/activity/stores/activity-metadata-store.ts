"use client";

import { ApiType } from "@/src/types/configuration-types";
import * as zustand from "zustand";
import { SyncMetaData } from "@/types/types";

/* carrying the ApiType in the State is redundant, problem for later */

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
