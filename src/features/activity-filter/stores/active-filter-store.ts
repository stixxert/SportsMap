"use client";

import * as zustand from "zustand";

import { ActivityAggregationSelector } from "@/features/activity-aggregation";
import { defaultFilter } from "@/features/activity-filter/default-filter";
import { AvailabilityStore, createAvailabilityStore } from "@/utils/store";

interface ActivityFilterState {
  filter: ActivityAggregationSelector;
}

interface ActivityFilterActions {
  setFilter: (filter: ActivityAggregationSelector) => void;
}

type ActivityFilterStore = ActivityFilterState & ActivityFilterActions;

export const useActivityFilterStore = zustand.create<ActivityFilterStore>(
  (set) => ({
    filter: defaultFilter,
    setFilter: (filter: ActivityAggregationSelector) =>
      set({
        filter,
      }),
  }),
);

export const useActivityFilter = () =>
  useActivityFilterStore((state) => state.filter);

export const useSetActivityFilter = () =>
  useActivityFilterStore((state) => state.setFilter);

export const useFilterAggregationProcessingStore =
  zustand.create<AvailabilityStore>((set) => ({
    ...createAvailabilityStore(set),
  }));

export const useFilterAggregationProcessingStatus = () =>
  useFilterAggregationProcessingStore((state) => state.loading);
