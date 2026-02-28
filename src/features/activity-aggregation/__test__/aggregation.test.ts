import "fake-indexeddb/auto";
import "@/features/activity/lib/activity-schema";
import "@/features/activity-aggregation/lib/schema";

import { IDBFactory } from "fake-indexeddb";
import { beforeEach } from "@jest/globals";
import { openActivityDatabase } from "@/lib/activity/db";
import { seedActivities } from "@/lib/demo-data/seed-activities";
import { dispatchActivityAggregation } from "@/features/activity-aggregation/lib/dispatch-aggregate";

import { SportType } from "@/src/generated/strava-api";

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

    const _index = index as string;

    if (!mergedIndex && !index) {
      mergedIndex = _index;
      continue;
    }

    mergedIndex = (mergedIndex ?? "").concat(_index);
  }
  return mergedIndex ?? "";
};

const mockComlinkWrappedWorker: AggregationWorkerActions = {
  processWorkerTask,
};

const ALL_SPORTS_TYPES = Object.keys(SportType) as SportType[];

jest.mock("comlink", () => {
  return { wrap: () => mockComlinkWrappedWorker };
});

describe("Activity Aggregation", () => {
  let activityDatabase: ActivityDatabase;

  let comlinkPool: RemoteProxy<AggregationWorkerActions>[];

  let firstInsertionOptions: { start?: Date; end?: Date };

  beforeEach(async () => {
    global.Worker = jest.fn();

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

    await seedActivities(activityDatabase, 1000, 0, firstInsertionOptions);

    aggregationHandlers[AggregationCategory.Spatial] = {
      aggregate: transformData,
      mergeAggregate: mergeTransformData,
    };
  });

  afterEach(async () => {
    activityDatabase.close();
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

      const activitiesInCategory = await getActivities(
        activityDatabase,
        options,
      );

      expect(databaseReturnedIndex).toBeDefined();

      expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
        "emptyIndex",
      );
    }
  });

  test("can aggregate data from multiple SportTypes", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: new Date(Date.now()),
    };

    const indexType = AggregationCategory.Spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      indexType,
      options,
    );

    const activitiesInCategory = await getActivities(activityDatabase, options);

    if (activitiesInCategory.length > 0) {
      expect(databaseReturnedIndex).toBeDefined();

      expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
        "emptyIndex",
      );
    } else expect(databaseReturnedIndex).not.toBeDefined();
  });

  test("can use existing updatedAt, to fill in part of aggregation range", async () => {
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

    await seedActivities(activityDatabase, 1000, 1000, opt);

    await dispatchActivityAggregation(ApiType.Demo, options, comlinkPool);

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      indexType,
      options,
    );

    const activitiesInCategory = await getActivities(activityDatabase, options);

    if (activitiesInCategory.length > 0) {
      expect(databaseReturnedIndex).toBeDefined();

      expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
        "emptyIndexemptyIndex",
      );
    } else expect(databaseReturnedIndex).not.toBeDefined();
  });
});
