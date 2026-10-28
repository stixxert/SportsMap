"use client";

import { getActivities } from "@/features/activity/lib/store-actions";
import { openActivityDatabase } from "@/lib/activity/db";

import { Activity } from "@/lib/strava/types";

import { AggregationInput } from "@/features/activity-aggregation/types/aggregation";

import { breakdownActivity } from "@/lib/activity-map-breakdown";
import { aggregationHandlers } from "@/features/activity-aggregation/handlers";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import {
  AggregatedIndex,
  AggregationTaskType,
} from "@/types/activity-aggregation";
import {
  getAggregatedData,
  setAggregatedData,
} from "@/lib/activity-aggregation/aggregation-schema";
import { ActivityDatabase } from "@/lib/activity/activity-schema";

import { ApiType } from "@/lib/auth/api-types";

export async function processWorkerTask(
  taskType: AggregationTaskType,
  originType: ApiType,
  selector: ActivityAggregationSelector,
) {
  const db = await openActivityDatabase(originType);

  await performActivityAggregation(db, taskType, selector);
}

export function breakdownActivities(activities: Activity[]) {
  return activities.map((activity) => ({
    input: breakdownActivity(activity),
    owner: activity.id,
  })) as AggregationInput;
}

export async function performActivityAggregation(
  db: ActivityDatabase,
  taskType: AggregationTaskType,
  selectionOptions: ActivityAggregationSelector,
): Promise<void> {
  const existingAggregatedIndex = await getAggregatedData(
    db,
    taskType,
    selectionOptions,
  );

  const adjustedStartDate = selectionOptions.startDate;

  /*
  TODO: Should we use existing aggregation for a lower-bound subset of the requested aggregate?
  if (existingAggregatedIndex && existingAggregatedIndex.updatedAt)
    adjustedStartDate = existingAggregatedIndex.updatedAt;
  */

  const adjustedOptions = Object.assign({}, selectionOptions, {
    startDate: adjustedStartDate,
  });

  const activities = await getActivities(db, adjustedOptions);

  const aggregationInput = breakdownActivities(activities);

  if (!aggregationHandlers[taskType])
    throw new Error(
      `Missing Aggregator Task processor for: ${taskType.toString()}`,
    );

  const { aggregate, mergeAggregate } = aggregationHandlers[taskType];

  const aggregationResults = aggregate(aggregationInput);

  let mergedAggregationOutputs = aggregationResults;

  if (existingAggregatedIndex) {
    if (!mergeAggregate)
      throw new Error(
        `Missing Aggregator Merge Task processor for: ${taskType.toString()}`,
      );

    mergedAggregationOutputs = mergeAggregate([
      existingAggregatedIndex.index,
      aggregationResults,
    ]);
  }

  await setAggregatedRow(
    db,
    taskType,
    selectionOptions,
    mergedAggregationOutputs,
  );
}

async function setAggregatedRow(
  db: ActivityDatabase,
  taskType: AggregationTaskType,
  selectionOptions: ActivityAggregationSelector,
  index: unknown,
) {
  const aggregatedRow = Object.assign(
    {},
    selectionOptions,
    { updatedAt: new Date(Date.now()) },
    { index: index },
  ) as unknown as AggregatedIndex;

  await setAggregatedData(db, taskType, aggregatedRow);
}
