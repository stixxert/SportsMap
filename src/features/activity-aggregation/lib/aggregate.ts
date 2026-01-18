/*
 * Transform source data (activities) into types of elements.
 */

import { getActivities } from "@/features/activity/lib/data/store-actions";
import { IDBPIndex } from "idb";
import { SummaryActivity } from "@/strava-api";
import {
  ActivityDatabase,
  ActivitySchema,
} from "@/lib/db/origin-related-activity-db";
import { createSubscribeRegistry } from "@/lib/registry";
import {
  AggregationInput,
  AggregationOutput,
  MergeAggregationInput,
} from "@/features/activity-aggregation/types/aggregation";
import { breakdownActivity } from "@/features/activity-aggregation/lib/map-breakdown";
import {
  AggregatedIndexValue,
  getAggregatedData,
  setAggregatedData,
} from "@/features/activity-aggregation/lib/schema";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";

const aggregateRegistry = createSubscribeRegistry<
  AggregationInput,
  AggregationOutput<unknown>
>();

const mergeAggregateRegistry = createSubscribeRegistry<
  MergeAggregationInput<unknown>[],
  AggregationOutput<unknown>
>();

export const subscribeToAggregation = aggregateRegistry.subscribe;

export const subscribeToMergeAggregation = mergeAggregateRegistry.subscribe;

async function getBoundaryValue(
  index: IDBPIndex<
    ActivitySchema,
    ["activities"],
    "activities",
    string,
    "readonly"
  >,
  boundary: "first" | "last",
) {
  const cursor = await index.openCursor(
    undefined,
    boundary === "first" ? "next" : "prev",
  );

  return cursor ? (cursor?.value as SummaryActivity) : null;
}

/*
async function aggregateActivityDatabase(db: ActivityDatabase) {
  const tx = db.transaction(ACTIVITY_STORE, "readonly");

  const store = tx.store;

  const dateIndex = store.index(INDEXES.DATE);

  const first = await getBoundaryValue(dateIndex, "first");

  const last = await getBoundaryValue(dateIndex, "last");

  const allActivities = await store.getAll();

  const breakdown = allActivities.map((activity) => ({
    input: breakdownActivity(activity),
    owner: activity.id,
  })) as AggregationInput;
}*/

export function breakdownActivities(activities: SummaryActivity[]) {
  return activities.map((activity) => ({
    input: breakdownActivity(activity),
    owner: activity.id,
  })) as AggregationInput;
}

function constructMappedAggregationIndexes(
  outputs: AggregationOutput<unknown>[],
): { [key: string]: unknown } {
  return Object.assign(
    {},
    ...outputs.map((result) => ({
      [result.aggregationType]: result.output,
    })),
  );
}

export async function performActivityAggregation(
  db: ActivityDatabase,
  selectionOptions: ActivityAggregationSelector,
) {
  const existingAggregatedIndex = await getAggregatedData(db, selectionOptions);

  const adjustedStartDateSearch = existingAggregatedIndex
    ? existingAggregatedIndex.updatedAt
    : selectionOptions.startDate;

  const adjustedOptions = Object.assign({}, selectionOptions, {
    startDate: adjustedStartDateSearch,
  });

  const activities = await getActivities(db, adjustedOptions);

  const aggregationInput = breakdownActivities(activities);

  const aggregationResults = aggregateRegistry.callbacks.map((aggregate) =>
    aggregate(aggregationInput),
  );

  const mappedAggregationOutputs =
    constructMappedAggregationIndexes(aggregationResults);

  let mergedAggregationOutputs = mappedAggregationOutputs;

  if (existingAggregatedIndex) {
    const mergedOutputs = mergeAggregateRegistry.callbacks.map((aggregate) =>
      aggregate([existingAggregatedIndex, mappedAggregationOutputs]),
    );

    mergedAggregationOutputs = constructMappedAggregationIndexes(mergedOutputs);
  }

  const aggregatedRow = Object.assign(
    {},
    selectionOptions,
    { updatedAt: new Date(Date.now()) },
    mergedAggregationOutputs,
  ) as unknown as AggregatedIndexValue;

  await setAggregatedData(db, aggregatedRow);

  return aggregatedRow;
}
