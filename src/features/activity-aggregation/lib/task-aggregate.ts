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
import {
  AggregationInput,
  AggregationTaskType,
  TaskAggregator,
} from "@/features/activity-aggregation/types/aggregation";
import { breakdownActivity } from "@/features/activity-aggregation/lib/map-breakdown";
import {
  AggregatedIndex,
  getAggregatedData,
  setAggregatedData,
} from "@/features/activity-aggregation/lib/schema";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";

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

export async function performActivityAggregation(
  db: ActivityDatabase,
  taskType: AggregationTaskType,
  selectionOptions: ActivityAggregationSelector,
): Promise<boolean> {
  const existingAggregatedIndex = await getAggregatedData(
    db,
    taskType,
    selectionOptions,
  );

  const adjustedStartDateSearch = existingAggregatedIndex
    ? existingAggregatedIndex.updatedAt
    : selectionOptions.startDate;

  const adjustedOptions = Object.assign({}, selectionOptions, {
    startDate: adjustedStartDateSearch,
  });

  const activities = await getActivities(db, adjustedOptions);

  const aggregationInput = breakdownActivities(activities);

  if (!aggregationHandlers[taskType])
    throw new Error("Missing Aggregator Task processor");

  const { aggregate, mergeAggregate } = aggregationHandlers[taskType];

  const aggregationResults = aggregate(aggregationInput);

  let mergedAggregationOutputs = aggregationResults;

  if (existingAggregatedIndex) {
    if (!mergeAggregate)
      throw new Error("Missing Aggregator Merge Task processor");

    mergedAggregationOutputs = mergeAggregate([
      existingAggregatedIndex.index,
      aggregationResults,
    ]);
  }

  const aggregatedRow = Object.assign(
    {},
    selectionOptions,
    { updatedAt: new Date(Date.now()) },
    { index: mergedAggregationOutputs },
  ) as unknown as AggregatedIndex;

  await setAggregatedData(db, taskType, aggregatedRow);

  return true;
}
