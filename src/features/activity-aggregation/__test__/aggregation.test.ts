import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach } from "@jest/globals";
import {
  ActivityDatabase,
  openActivityDatabase,
} from "@/lib/db/origin-related-activity-db";
import { ApiType } from "@/types/configuration-types";
import { seedActivities } from "@/features/activity/testing/seed-activities";
import {
  performActivityAggregation,
  subscribeToAggregation,
  subscribeToMergeAggregation,
} from "@/features/activity-aggregation/lib/aggregate";
import { SportType } from "@/strava-api";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import {
  AggregatedIndexValue,
  ALL_SPORTS_TYPES,
  getAggregatedData,
} from "@/features/activity-aggregation/lib/schema";

import {
  AggregationIndexerFn,
  MergeAggregationInput,
} from "@/features/activity-aggregation/types/aggregation";
import { MAX_UPPER_BOUNDS } from "@/utils/db";

const transformData: AggregationIndexerFn = () => {
  return {
    output: "emptyIndex",
    aggregationType: "testIndex",
  };
};

const mergeTransformData: AggregationIndexerFn<
  MergeAggregationInput<unknown>[]
> = (input: MergeAggregationInput<unknown>[]) => {
  let mergedIndex: string | undefined = undefined;

  for (const wrappedIndex of input) {
    if (!Object.hasOwn(wrappedIndex, "testIndex")) continue;

    const index = wrappedIndex["testIndex"] as string;

    if (!mergedIndex) {
      mergedIndex = index;
      continue;
    }

    mergedIndex = mergedIndex.concat(index);
  }

  return {
    output: mergedIndex ?? "",
    aggregationType: "testIndex",
  };
};

describe("Activity Aggregation", () => {
  let activityDatabase: ActivityDatabase;

  beforeEach(async () => {
    globalThis.indexedDB = new IDBFactory();

    activityDatabase = await openActivityDatabase(ApiType.Demo);

    await seedActivities(activityDatabase, 1000);

    subscribeToAggregation(transformData);

    subscribeToMergeAggregation(mergeTransformData);
  });

  afterEach(async () => {
    activityDatabase.close();
  });

  test("adds database entry and returns aggregation index", async () => {
    const sharedOptions = {
      startDate: new Date(0),
      endDate: new Date(Date.now()),
    };
    for (const sportType of Object.keys(SportType)) {
      const options: ActivityAggregationSelector = {
        ...sharedOptions,
        sportType: sportType as SportType,
      };

      const returnedIndex = await performActivityAggregation(
        activityDatabase,
        options,
      );

      const databaseReturnedIndex = await getAggregatedData(
        activityDatabase,
        options,
      );

      expect(!Array.isArray(databaseReturnedIndex));

      const _databaseIndexCast = databaseReturnedIndex as AggregatedIndexValue;

      expect(returnedIndex).toEqual(_databaseIndexCast);
    }
  });

  test("can aggregate data from multiple SportTypes", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: new Date(Date.now()),
    };

    const returnedIndex = await performActivityAggregation(
      activityDatabase,
      options,
    );

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      options,
    );

    expect(!Array.isArray(databaseReturnedIndex));

    const _databaseIndexCast = databaseReturnedIndex as AggregatedIndexValue;

    expect(returnedIndex).toEqual(_databaseIndexCast);
  });

  test("can use existing updatedAt, to fill in part of aggregation range", async () => {
    const options = {
      sportType: ALL_SPORTS_TYPES,
      startDate: new Date(0),
      endDate: MAX_UPPER_BOUNDS.date,
    };

    await performActivityAggregation(activityDatabase, options);

    await seedActivities(activityDatabase, 1000, 1000, {
      start: new Date(Date.now()),
      end: new Date(new Date(Date.now()).getFullYear() + 1),
    });

    const optionsSecondPass = Object.assign({}, options);

    const returnedIndex = await performActivityAggregation(
      activityDatabase,
      optionsSecondPass,
    );

    const databaseReturnedIndex = await getAggregatedData(
      activityDatabase,
      optionsSecondPass,
    );

    expect(!Array.isArray(databaseReturnedIndex));

    const _databaseIndexCast = databaseReturnedIndex as AggregatedIndexValue;

    expect(returnedIndex).toEqual(_databaseIndexCast);

    expect(returnedIndex["testIndex"]).toEqual("emptyIndexemptyIndex");
  });
});
