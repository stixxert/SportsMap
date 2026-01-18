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
} from "@/features/activity-aggregation/types/aggregation";
import { breakdownActivity } from "@/features/activity-aggregation/lib/map-breakdown";
import {
  AggregatedIndexValue,
  setAggregatedData,
} from "@/features/activity-aggregation/lib/schema";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";

const aggregateRegistry = createSubscribeRegistry<
  AggregationInput,
  AggregationOutput<unknown>
>();

export const subscribeToAggregation = aggregateRegistry.subscribe;

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
  selectionOptions: ActivityAggregationSelector,
) {
  const activities = await getActivities(db, selectionOptions);

  const aggregationInput = breakdownActivities(activities);

  const aggregationResults = aggregateRegistry.callbacks.map((aggregate) =>
    aggregate(aggregationInput),
  );

  const mappedAggregationOutputs = aggregationResults.map((result) => ({
    [result.aggregationType]: result.output,
  }));

  const aggregatedRow = Object.assign(
    {},
    selectionOptions,
    { updatedAt: new Date(Date.now()) },
    Object.assign({}, ...mappedAggregationOutputs),
  ) as unknown as AggregatedIndexValue;

  await setAggregatedData(db, aggregatedRow);

  return aggregatedRow;
}
