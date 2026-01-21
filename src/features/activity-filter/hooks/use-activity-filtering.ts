import {
  useActivityFilter,
  useFilterAggregationProcessingStatus,
  useFilterAggregationProcessingStore,
} from "@/features/activity-filter/stores/active-filter-store";
import { useApiType } from "@/features/auth/stores/api-store";
import { useActivitySyncStore } from "@/features/activity/stores/activity-store";
import { useAggregateDispatcher } from "@/features/activity-aggregation";
import { useCallback, useEffect } from "react";
import { ApiType } from "@/types/configuration-types";
import { ActivityAggregationSelector } from "@/features/activity-aggregation";
import { getAggregatedData } from "@/features/activity-aggregation/lib/schema";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";
import { AggregationTask } from "@/features/activity-aggregation/types/aggregation";
import { useSpatialIndexStore } from "@/features/activity-filter/stores/aggregation-stores";
import { getSpatialIndexFromAggregateIndex } from "@/features/activity-aggregation/heat-tiles/aggregate";

export function useActivityFiltering() {
  const filterOptions = useActivityFilter();

  const apiType = useApiType();

  const activitySyncStatus = useActivitySyncStore(
    (state) => state.activitiesSync,
  );

  const performAggregate = useAggregateDispatcher();

  const filterProcessingActive = useFilterAggregationProcessingStatus();
  const setFilterProcessingActive = useFilterAggregationProcessingStore(
    (state) => state.setLoading,
  );

  const runAggregationProcessing = useCallback(
    async (type: ApiType, options: ActivityAggregationSelector) => {
      if (!type) return;

      // TODO: What to catch?
      await performAggregate(type, options);

      console.log("completed?");

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

  async function spatialUpdateCallback(
    type: ApiType,
    options: ActivityAggregationSelector,
  ) {
    if (!type) return;

    const db = await openActivityDatabase(type);

    const index = await getAggregatedData(db, AggregationTask.spatial, options);

    useSpatialIndexStore
      .getState()
      .setIndex(
        index ? (getSpatialIndexFromAggregateIndex(index) ?? null) : null,
      );
  }

  useEffect(() => {
    if (filterProcessingActive !== false) return;

    if (!apiType) return;

    void spatialUpdateCallback(apiType, filterOptions);
  }, [apiType, filterOptions, filterProcessingActive]);
}
