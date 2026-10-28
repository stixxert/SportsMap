import "@/features/activity/lib/activity-schema";
import "@/features/activity-aggregation/lib/schema";

import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { closeActivityDatabase, openActivityDatabase } from "@/lib/activity/db";
import { seedActivities } from "@/lib/demo-data/seed-activities";
import { dispatchActivityAggregation } from "@/features/activity-aggregation/lib/dispatch-aggregate";

import { SportType } from "@/lib/strava/types";

import {
  AggregationIndexerFn,
  AggregationOutput,
  AggregationWorkerActions,
} from "@/features/activity-aggregation/types/aggregation";
import { MAX_UPPER_BOUNDS } from "@/utils/db";
import { AGGREGATE_WORKER_COUNT } from "@/features/activity-aggregation/hooks/use-workers";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";
import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";
import { getActivities } from "@/features/activity/lib/store-actions";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import {
  AggregatedIndex,
  AggregationCategory,
} from "@/types/activity-aggregation";
import { getAggregatedData } from "@/lib/activity-aggregation/aggregation-schema";
import { ActivityDatabase } from "@/lib/activity/activity-schema";

import { ApiType } from "@/lib/auth/api-types";
import { RemoteProxy } from "@/utils/worker-store-template";

const transformData: AggregationIndexerFn = () => "emptyIndex";

const mergeTransformData: AggregationIndexerFn<AggregationOutput[]> = (
  input: AggregationOutput[],
) => {
  let mergedIndex: string | undefined = undefined;

  for (const index of input) {
    if (!index) continue;

    mergedIndex = (mergedIndex ?? "").concat(index as string);
  }
  return mergedIndex ?? "";
};

const mockComlinkWrappedWorker: AggregationWorkerActions = {
  processWorkerTask,
};

const ALL_SPORTS_TYPES = Object.keys(SportType) as SportType[];

// These tests exercise the aggregation pipeline and its persistence shape, so the exact
// row count is irrelevant — keep it small enough that the suite stays fast.
const SEED_COUNT = 100;

vi.mock("comlink", () => ({ wrap: () => mockComlinkWrappedWorker }));

describe("Activity Aggregation", () => {
  let activityDatabase: ActivityDatabase;

  let comlinkPool: RemoteProxy<AggregationWorkerActions>[];

  let firstInsertionOptions: { start?: Date; end?: Date };

  let originalSpatialHandler: (typeof aggregationHandlers)[typeof AggregationCategory.Spatial];

  beforeEach(async () => {
    globalThis.indexedDB = new IDBFactory();

    comlinkPool = Array.from({ length: AGGREGATE_WORKER_COUNT }).map(
      () => mockComlinkWrappedWorker as RemoteProxy<AggregationWorkerActions>,
    );

    activityDatabase = await openActivityDatabase(ApiType.Demo);

    firstInsertionOptions = {
      end: new Date(
        new Date(Date.now()).setFullYear(
          new Date(Date.now()).getFullYear() - 1,
        ),
      ),
    };

    await seedActivities(activityDatabase, SEED_COUNT, 0, firstInsertionOptions);

    originalSpatialHandler =
      aggregationHandlers[AggregationCategory.Spatial];

    aggregationHandlers[AggregationCategory.Spatial] = {
      aggregate: transformData,
      mergeAggregate: mergeTransformData,
    };
  });

  afterEach(async () => {
    // Restore the shared handler table so tests stay order-independent, and drop the
    // memoised connection (opening the DB is cached per origin).
    aggregationHandlers[AggregationCategory.Spatial] = originalSpatialHandler;
    await closeActivityDatabase(ApiType.Demo);
  });

  test("adds database entry and returns aggregation index", async () => {
    const sharedOptions = {
      startDate: new Date(0),
      endDate: new Date(Date.now()),
    };

    const indexType = AggregationCategory.Spatial;

    for (const sportType of Object.keys(SportType)) {
      const options: ActivityAggregationSelector = {
        ...sharedOptions,
        sportType: sportType as SportType,
      };

      await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

      const databaseReturnedIndex = await getAggregatedData(
        activityDatabase,
        indexType,
        options,
      );

      expect(databaseReturnedIndex).toBeDefined();
      expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
        "emptyIndex",
      );
    }
  });

  test("can aggregate data from multiple SportTypes", async () => {
    // Seed data is generated over the last year, so this range must contain rows.
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: firstInsertionOptions.start ?? new Date(0),
      endDate: new Date(Date.now()),
    };

    const indexType = AggregationCategory.Spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

    const activitiesInCategory = await getActivities(activityDatabase, options);

    // Guard the guard: if the fixture ever stops producing rows, this test is meaningless.
    expect(activitiesInCategory.length).toBeGreaterThan(0);

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      indexType,
      options,
    );

    expect(databaseReturnedIndex).toBeDefined();
    expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
      "emptyIndex",
    );
  });

  test("merges into an existing aggregate row on a later run", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: MAX_UPPER_BOUNDS.date,
    };

    const indexType = AggregationCategory.Spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

    const opt = {
      start: firstInsertionOptions.end || new Date(0),
      end: new Date(
        new Date(Date.now()).setFullYear(
          new Date(Date.now()).getFullYear() + 1,
        ),
      ),
    };

    await seedActivities(activityDatabase, SEED_COUNT, SEED_COUNT, opt);

    await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      indexType,
      options,
    );

    const activitiesInCategory = await getActivities(activityDatabase, options);

    expect(activitiesInCategory.length).toBeGreaterThan(0);
    expect(databaseReturnedIndex).toBeDefined();
    expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
      "emptyIndexemptyIndex",
    );
  });
});
