import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach } from "@jest/globals";
import {
  ActivityDatabase,
  openActivityDatabase,
} from "@/lib/db/origin-related-activity-db";
import { ApiType } from "@/types/configuration-types";
import { seedActivities } from "@/features/activity/testing/seed-activities";
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
} from "@/features/activity-aggregation/types/aggregation";
import { MAX_UPPER_BOUNDS } from "@/utils/db";
import AggregationMockWorker from "@/features/activity-aggregation/__mock__/aggregation.worker";
import { AGGREGATE_WORKER_COUNT } from "@/features/activity-aggregation/hooks/use-workers";
import { aggregateHandlers } from "@/features/activity-aggregation/spatial-index/aggregate";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";

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

describe("Activity Aggregation", () => {
  let activityDatabase: ActivityDatabase;

  let workerPool: Worker[];

  beforeEach(async () => {
    global.Worker = AggregationMockWorker;

    globalThis.indexedDB = new IDBFactory();

    workerPool = Array.from({ length: AGGREGATE_WORKER_COUNT }).map(
      () => new Worker(""),
    );

    activityDatabase = await openActivityDatabase(ApiType.Demo);

    await seedActivities(activityDatabase, 1000);

    aggregationHandlers[AggregationTask.spatial] = {
      aggregate: transformData,
      mergeAggregate: mergeTransformData,
    };

    aggregationHandlers[AggregationTask.heat] = {
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

    const indexType = AggregationTask.spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

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

  test("can use existing updatedAt, to fill in part of aggregation range", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: MAX_UPPER_BOUNDS.date,
    };

    const indexType = AggregationTask.spatial;
    await dispatchActivityAggregation(ApiType.Demo, options, workerPool);

    await seedActivities(activityDatabase, 1000, 1000, {
      start: new Date(Date.now()),
      end: new Date(new Date(Date.now()).getFullYear() + 1),
    });

    const optionsSecondPass = Object.assign({}, options);

    await dispatchActivityAggregation(
      ApiType.Demo,
      optionsSecondPass,
      workerPool,
    );

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      indexType,
      optionsSecondPass,
    );

    expect(databaseReturnedIndex).toBeDefined();

    expect((databaseReturnedIndex as AggregatedIndex).index).toEqual(
      "emptyIndexemptyIndex",
    );
  });
});
