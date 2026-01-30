import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach } from "@jest/globals";
import {
  ActivityDatabase,
  openActivityDatabase,
} from "@/lib/db/origin-related-activity-db";
import { ApiType } from "@/types/configuration-types";
import { seedActivities } from "@/features/activity/demo-data/seed-activities";
import { dispatchActivityAggregation } from "@/features/activity-aggregation/lib/dispatch-aggregate";

import { SportType } from "@/strava-api";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import {
  AggregatedIndex,
  ALL_SPORTS_TYPES,
  getAggregatedData,
} from "@/features/activity-aggregation/lib/schema";

import {
  AggregationIndexerFn,
  AggregationOutput,
  AggregationTask,
  AggregationWorkerActions,
} from "@/features/activity-aggregation/types/aggregation";
import { MAX_UPPER_BOUNDS } from "@/utils/db";
import { AGGREGATE_WORKER_COUNT } from "@/features/activity-aggregation/hooks/use-workers";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";
import { processWorkerTask } from "@/features/activity-aggregation/lib/task-aggregate";
import { getActivities } from "@/features/activity/lib/data/store-actions";

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

jest.mock("comlink", () => {
  return { wrap: () => mockComlinkWrappedWorker };
});

describe("Activity Aggregation", () => {
  let activityDatabase: ActivityDatabase;

  let workerPool: Worker[];

  let firstInsertionOptions: { start?: Date; end?: Date };

  beforeEach(async () => {
    global.Worker = jest.fn();

    globalThis.indexedDB = new IDBFactory();

    workerPool = Array.from({ length: AGGREGATE_WORKER_COUNT }).map(
      () => new Worker(""),
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

    aggregationHandlers[AggregationTask.spatial] = {
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

    const indexType = AggregationTask.spatial;

    for (const sportType of Object.keys(SportType)) {
      const options: ActivityAggregationSelector = {
        ...sharedOptions,
        sportType: sportType as SportType,
      };

      await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

      const databaseReturnedIndex = await getAggregatedData(
        activityDatabase,
        indexType,
        options,
      );

      const activitiesInCategory = await getActivities(
        activityDatabase,
        options,
      );

      if (activitiesInCategory.length > 0) {
        expect(databaseReturnedIndex).toBeDefined();

        expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
          "emptyIndex",
        );
      } else expect(databaseReturnedIndex).not.toBeDefined();
    }
  });

  test("can aggregate data from multiple SportTypes", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: new Date(Date.now()),
    };

    const indexType = AggregationTask.spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

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

    const indexType = AggregationTask.spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

    const opt = {
      start: firstInsertionOptions.end || new Date(0),
      end: new Date(
        new Date(Date.now()).setFullYear(
          new Date(Date.now()).getFullYear() + 1,
        ),
      ),
    };

    await seedActivities(activityDatabase, 1000, 1000, opt);

    await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

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
