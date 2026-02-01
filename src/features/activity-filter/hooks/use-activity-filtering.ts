import {
  useActivityFilter,
  useFilterAggregationProcessingStore,
} from "@/features/activity-filter/stores/active-filter-store";
import { useApiType } from "@/features/auth/stores/api-store";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";
import { useAggregateDispatcher } from "@/features/activity-aggregation";
import { useCallback, useEffect } from "react";
import { ApiType } from "@/types/configuration-types";
import { ActivityAggregationSelector } from "@/features/activity-aggregation";
export function useActivityFiltering() {
  const filterOptions = useActivityFilter();

  const apiType = useApiType();

  const activitySyncStatus = useActivitySyncStore(
    (state) => state.activitiesSync,
  );

  const performAggregate = useAggregateDispatcher();

  const setFilterProcessingActive = useFilterAggregationProcessingStore(
    (state) => state.setLoading,
  );

  const runAggregationProcessing = useCallback(
    async (type: ApiType, options: ActivityAggregationSelector) => {
      if (!type) return;

      // TODO: What to catch?
      await performAggregate(type, options);

      setFilterProcessingActive(false);
    },
    [performAggregate, setFilterProcessingActive],
  );

  useEffect(() => {
    if (!activitySyncStatus) return;

    if (!apiType) return;

    /* already loading */
    if (useFilterAggregationProcessingStore.getState().loading === true) return;

    setFilterProcessingActive(true);

    void runAggregationProcessing(apiType, filterOptions);
  }, [
    activitySyncStatus,
    apiType,
    filterOptions,
    runAggregationProcessing,
    setFilterProcessingActive,
  ]);
}
