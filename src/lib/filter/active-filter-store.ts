"use client";

import * as zustand from "zustand";
import { persist } from "zustand/middleware";

import { defaultFilter } from "@/config/default-filter";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { createReadinessStore } from "@/utils/ready-state-store";
interface ActivityFilterState {
  filter: ActivityAggregationSelector;
}

interface ActivityFilterActions {
  setFilter: (filter: ActivityAggregationSelector) => void;
}

export type ActivityFilterStore = ActivityFilterState & ActivityFilterActions;

export const useDefaultActivityFilterStore =
  zustand.create<ActivityFilterStore>()(
    persist(
      (set) => ({
        filter: defaultFilter,
        setFilter: (filter: ActivityAggregationSelector) =>
          set({
            filter,
          }),
      }),
      {
        name: "default-filter",
      },
    ),
  );

export const getDefaultFilter = () =>
  useDefaultActivityFilterStore.getState().filter;

export const setDefaultFilter = () =>
  useDefaultActivityFilterStore.getState().setFilter;

export const useActivityFilterStore = zustand.create<ActivityFilterStore>(
  (set) => ({
    filter: parsePersistedSelector(getDefaultFilter()),
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

export const useFilterProcessingResults = createReadinessStore();

export const useFilterProcessingResultsStatus = () =>
  useFilterProcessingResults((state) => state.ready);

export function parsePersistedSelector(selector: ActivityAggregationSelector) {
  return Object.assign({}, selector, {
    startDate: new Date(selector.startDate),
    endDate: new Date(selector.endDate),
  });
}
