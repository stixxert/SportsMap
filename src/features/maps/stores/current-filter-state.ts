import { ActivityAggregationSelector } from "@/types/activity-selection";
import * as zustand from "zustand";
import {
  ActivityFilterStore,
  getDefaultFilter,
  parsePersistedSelector,
  useActivityFilter,
  useFilterProcessingResults,
  useSetActivityFilter,
} from "@/lib/filter/active-filter-store";
import { compressSpan } from "@/lib/activity/sport-type-compression";

export const useFilterModifyStore = zustand.create<ActivityFilterStore>(
  (set) => ({
    filter: parsePersistedSelector(getDefaultFilter()),
    setFilter: (filter: ActivityAggregationSelector) =>
      set({
        filter,
      }),
  }),
);

export function useApplyFilter() {
  const selectorFilter = useActivityFilter();
  const setSelectorFilter = useSetActivityFilter();

  const currentFilter = useFilterModifyStore((state) => state.filter);

  return () => {
    if (!useFilterProcessingResults.getState().ready) return;

    if (
      compressSpan(currentFilter.sportType) ===
        compressSpan(selectorFilter.sportType) &&
      currentFilter.startDate === selectorFilter.startDate &&
      currentFilter.endDate === selectorFilter.endDate
    ) {
      return;
    }

    setSelectorFilter(currentFilter);
  };
}
