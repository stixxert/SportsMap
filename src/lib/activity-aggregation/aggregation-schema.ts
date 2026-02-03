"use client";

import { ActivityDatabase } from "@/lib/activity/activity-schema";
import {
  AggregatedIndex,
  AggregatedSchemaIndex,
  AggregationTaskType,
} from "@/types/activity-aggregation";
import { ActivityAggregationSelector } from "@/types/activity-selection";
import {
  compressSpan,
  uncompressSpan,
} from "@/lib/activity/sport-type-compression";

export async function setAggregatedData(
  db: ActivityDatabase,
  indexType: AggregationTaskType,
  indexRow: AggregatedIndex[] | AggregatedIndex,
) {
  const tx = db.transaction(indexType, "readwrite");

  const store = tx.objectStore(indexType);

  async function insertRow(row: AggregatedIndex) {
    const convRow = Object.assign({}, row, {
      sportType: compressSpan(row.sportType),
    }) as AggregatedSchemaIndex;

    await store.put(convRow);
  }

  if (Array.isArray(indexRow)) {
    await Promise.all(indexRow.map((row) => insertRow(row)));
  } else {
    await insertRow(indexRow);
  }

  await tx.done;
}

export async function getAggregatedData(
  db: ActivityDatabase,
  indexType: AggregationTaskType,
  selectionOptions: ActivityAggregationSelector,
): Promise<AggregatedIndex | undefined> {
  const { sportType, startDate, endDate } = selectionOptions;

  async function getFromSportType(type: string) {
    const result = await db.get(indexType, [type, startDate, endDate]);

    if (!result) return undefined;

    return Object.assign({}, result, {
      sportType: uncompressSpan(result.sportType),
    }) as unknown as AggregatedIndex;
  }

  /*
   * TODO: How to handle SportType?
   * Should we search for entire span under [], or divide search ?
   * this has to be decided by caching strategy and granularity.
   */
  /*if (Array.isArray(sportType)) {
    const results = await Promise.all(
      sportType.map((type) => getFromSportType(type)),
    ).then((results) => results.filter((result) => result !== undefined));

    if (results.length === 0) return undefined;

    return results;
  }*/

  return getFromSportType(compressSpan(sportType));
}
