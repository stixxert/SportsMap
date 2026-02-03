"use client";

import * as zustand from "zustand";
import { SyncMetaData } from "@/features/activity/lib/sync-metadata";

import { ApiType } from "@/lib/auth/api-types";

/* carrying the ApiType in the State is (kinda) redundant, problem for later */

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
