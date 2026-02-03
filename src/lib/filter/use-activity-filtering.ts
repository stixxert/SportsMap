import {
  useActivityFilter,
  useFilterProcessingResults,
} from "@/lib/filter/active-filter-store";
import { useApiType } from "@/lib/auth/api-store";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useEffect } from "react";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { AggregationDispatcherFn } from "@/types/activity-aggregation";
import { ApiType } from "@/lib/auth/api-types";

export function useActivityFiltering(
  performAggregate: AggregationDispatcherFn,
) {
  const filterOptions = useActivityFilter();

  const apiType = useApiType();

  const activitySyncStatus = useActivitySyncStore(
    (state) => state.activitiesSync,
  );

  const setFilterProcessingReady = useFilterProcessingResults(
    (state) => state.setReady,
  );

  useEffect(() => {
    if (!activitySyncStatus) return;

    if (!apiType) return;

    /* already loading */
    if (useFilterProcessingResults.getState().ready === false) return;

    setFilterProcessingReady(false);

    const runAggregationProcessing = async (
      type: ApiType,
      options: ActivityAggregationSelector,
    ) => {
      if (!type) return;

      // TODO: What to catch?
      await performAggregate(type, options);

      setFilterProcessingReady(true);
    };

    void runAggregationProcessing(apiType, filterOptions);
  }, [
    activitySyncStatus,
    apiType,
    filterOptions,
    performAggregate,
    setFilterProcessingReady,
  ]);
}
