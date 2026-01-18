"use client";

import * as zustand from "zustand";

import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import { defaultFilter } from "@/features/activity-filter/default-filter";
import { AvailabilityStore, createAvailabilityStore } from "@/utils/store";
import { performActivityAggregation } from "@/features/activity-aggregation/lib/aggregate";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import { useSpatialIndexStore } from "@/features/activity-filter/stores/aggregation-stores";
import { getSpatialIndexFromAggregateIndex } from "@/features/activity-aggregation/spatial-index/aggregate";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";

interface ActivityFilterState {
  filter: ActivityAggregationSelector;
}

interface ActivityFilterActions {
  setFilter: (filter: ActivityAggregationSelector) => void;
}

type ActivityFilterStore = ActivityFilterState & ActivityFilterActions;

const useActivityFilterStore = zustand.create<ActivityFilterStore>((set) => ({
  filter: defaultFilter,
  setFilter: (filter: ActivityAggregationSelector) =>
    set({
      filter,
    }),
}));

export const useActivityFilter = () =>
  useActivityFilterStore((state) => state.filter);

export const useSetActivityFilter = () =>
  useActivityFilterStore((state) => state.setFilter);

const useFilterAggregationProcessingStore = zustand.create<AvailabilityStore>(
  (set) => ({
    ...createAvailabilityStore(set),
  }),
);

export const useFilterAggregationProcessingStatus = () =>
  useFilterAggregationProcessingStore((state) => state.loading);

async function filterResultsUpdate() {
  const syncStatus = useActivitySyncStore.getState().activitiesSync;

  if (!syncStatus) return;

  const apiType = useApiTypeStore.getState().apiType;

  if (!apiType) return;

  const isLoading = useFilterAggregationProcessingStore.getState().loading;

  /* already loading - we should not be here at all */
  if (isLoading === true) return;

  useFilterAggregationProcessingStore.getState().setLoading(true);

  const filterOptions = useActivityFilterStore.getState().filter;

  const db = await openActivityDatabase(apiType);

  const indexes = await performActivityAggregation(db, filterOptions);

  useSpatialIndexStore
    .getState()
    .setIndex(getSpatialIndexFromAggregateIndex(indexes) ?? null);

  useFilterAggregationProcessingStore.getState().setLoading(false);
}

useActivityFilterStore.subscribe(filterResultsUpdate);
useApiTypeStore.subscribe(filterResultsUpdate);
useActivitySyncStore.subscribe(filterResultsUpdate);
