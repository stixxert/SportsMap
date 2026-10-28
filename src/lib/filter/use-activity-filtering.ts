import {
  useActivityFilter,
  useFilterProcessingResults,
} from "@/lib/filter/active-filter-store";
import { useApiType } from "@/lib/auth/api-store";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useEffect, useRef } from "react";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import { AggregationDispatcherFn } from "@/types/activity-aggregation";
import { ApiType } from "@/lib/auth/api-types";
import { compressSpan } from "@/lib/activity/sport-type-compression";

/**
 * Re-aggregates whenever the filter, the data origin, or the sync state changes.
 *
 * Two defects were fixed here:
 *  1. `performAggregate` was a fresh closure on every render and sat in the dependency
 *     list, so any unrelated re-render of the wrapper re-dispatched a full aggregation
 *     over every activity. The filter is now keyed by value.
 *  2. If aggregation threw, the readiness flag stayed `false` forever and the guard at
 *     the top of the effect made it unrecoverable — a permanently stuck loading state.
 *     Failures are now logged, and the flag is always settled.
 */
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

  const running = useRef(false);

  const pending = useRef(false);

  // Value key: an equal filter with a new object identity must not re-trigger work.
  const filterKey = [
    apiType ?? "",
    compressSpan(filterOptions.sportType),
    filterOptions.startDate.getTime(),
    filterOptions.endDate.getTime(),
  ].join("|");

  // Keep the latest values without making them effect dependencies.
  const latest = useRef({ performAggregate, filterOptions });
  latest.current = { performAggregate, filterOptions };

  useEffect(() => {
    if (!activitySyncStatus) return;
    if (!apiType) return;

    // A change that lands mid-run must not be dropped: remember it and re-run once the
    // current aggregation settles.
    if (running.current) {
      pending.current = true;
      return;
    }

    running.current = true;
    setFilterProcessingReady(false);

    const run = async (type: ApiType, options: ActivityAggregationSelector) => {
      try {
        await latest.current.performAggregate(type, options);
      } catch (error) {
        // Never leave the UI spinning forever; surface it and continue with whatever
        // aggregate is already stored.
        console.error("Activity aggregation failed", error);
      } finally {
        running.current = false;
        setFilterProcessingReady(true);

        if (pending.current) {
          pending.current = false;
          // Re-arm by re-running the same path with the newest filter values.
          await run(type, latest.current.filterOptions);
        }
      }
    };

    void run(apiType, latest.current.filterOptions);
  }, [activitySyncStatus, apiType, filterKey, setFilterProcessingReady]);
}
