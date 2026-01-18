import { DBSchema } from "idb";
import {
  ActivityDatabase,
  subscribeToActivityDbUpgrade,
} from "@/lib/db/origin-related-activity-db";
import { SpatialIndexSchemaEntry } from "@/features/activity-aggregation/spatial-index/types";
import { ActivityAggregationSelector } from "@/features/activity-aggregation/types/data";

import { SportType } from "@/strava-api";
import {
  compressSpan,
  uncompressSpan,
} from "@/features/activity-aggregation/lib/type-span";

export const AGGREGATED_INDEXES_STORE = "aggregated-indexes";

export type SchemaEntry = { [key: string]: unknown };

/* TODO: Is endDate index (relatively) useless? */

export const INDEXES = {
  TYPE_START: "TYPE_START",
  TYPE_START_END: "TYPE_START_END",
};

export interface AggregatedIndexValue
  extends ActivityAggregationSelector,
    SpatialIndexSchemaEntry {
  updatedAt: Date;
}

type AggregatedIndexSchemaValue = Omit<AggregatedIndexValue, "sportType"> & {
  sportType: string;
};

export interface AggregatedIndexesSchema extends DBSchema {
  [AGGREGATED_INDEXES_STORE]: {
    key: [string, Date, Date];
    value: AggregatedIndexSchemaValue;
    indexes: {
      [INDEXES.TYPE_START]: [string, Date];
      [INDEXES.TYPE_START_END]: [string, Date, Date];
    };
  };
}

subscribeToActivityDbUpgrade((db) => {
  const activitiesStore = db.createObjectStore(AGGREGATED_INDEXES_STORE, {
    keyPath: ["sportType", "startDate", "endDate"],
  });

  activitiesStore.createIndex(INDEXES.TYPE_START, ["sportType", "startDate"], {
    unique: false,
  });
  activitiesStore.createIndex(
    INDEXES.TYPE_START_END,
    ["sportType", "startDate", "endDate"],
    { unique: true },
  );
});

export const ALL_SPORTS_TYPES = Object.keys(SportType) as SportType[];

const ALL_SPORTS_TYPES_COMPRESSED = compressSpan(ALL_SPORTS_TYPES);

export async function setAggregatedData(
  db: ActivityDatabase,
  indexRow: AggregatedIndexValue[] | AggregatedIndexValue,
) {
  const tx = db.transaction(AGGREGATED_INDEXES_STORE, "readwrite");

  const store = tx.objectStore(AGGREGATED_INDEXES_STORE);

  async function insertRow(row: AggregatedIndexValue) {
    const convRow = Object.assign({}, row, {
      sportType: compressSpan(row.sportType),
    }) as AggregatedIndexSchemaValue;

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
  selectionOptions: ActivityAggregationSelector,
): Promise<AggregatedIndexValue | undefined> {
  const { sportType, startDate, endDate } = selectionOptions;

  async function getFromSportType(type: string) {
    const result = await db.get(AGGREGATED_INDEXES_STORE, [
      type,
      startDate,
      endDate,
    ]);

    if (!result) return undefined;

    return Object.assign({}, result, {
      sportType: uncompressSpan(result.sportType),
    }) as unknown as AggregatedIndexValue;
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
