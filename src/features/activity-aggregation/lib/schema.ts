import { DBSchema } from "idb";
import {
  ActivityDatabase,
  subscribeToActivityDbUpgrade,
} from "@/lib/db/origin-related-activity-db";
import { ActivityAggregationSelector } from "@/features/activity-aggregation";

import { SportType } from "@/strava-api";
import {
  compressSpan,
  uncompressSpan,
} from "@/features/activity-aggregation/lib/type-span";
import {
  AggregationTask,
  AggregationTaskType,
} from "@/features/activity-aggregation/types/aggregation";

export type SchemaEntry = { index: unknown };

/* TODO: Is endDate index (relatively) useless? */

export const INDEXES = {
  TYPE_START: "TYPE_START",
  TYPE_START_END: "TYPE_START_END",
};

export interface AggregatedIndex extends ActivityAggregationSelector {
  index: unknown;
  updatedAt: Date;
}

type AggregatedSchemaIndex = Omit<AggregatedIndex, "sportType"> & {
  sportType: string;
};

interface BaseIndexSchema {
  key: [string, Date, Date];
  value: AggregatedSchemaIndex;
  indexes: {
    [INDEXES.TYPE_START]: [string, Date];
    [INDEXES.TYPE_START_END]: [string, Date, Date];
  };
}

export interface AggregatedIndexesSchema extends DBSchema {
  [AggregationTask.spatial]: BaseIndexSchema;
  [AggregationTask.heat]: BaseIndexSchema;
}

function setupStore(db: ActivityDatabase, storeName: AggregationTaskType) {
  const indexStore = db.createObjectStore(storeName, {
    keyPath: ["sportType", "startDate", "endDate"],
  });

  indexStore.createIndex(INDEXES.TYPE_START, ["sportType", "startDate"], {
    unique: false,
  });
  indexStore.createIndex(
    INDEXES.TYPE_START_END,
    ["sportType", "startDate", "endDate"],
    { unique: true },
  );
}

subscribeToActivityDbUpgrade((db) => {
  for (const store of Object.values(AggregationTask)) {
    setupStore(db, store);
  }
});

export const ALL_SPORTS_TYPES = Object.keys(SportType) as SportType[];

const ALL_SPORTS_TYPES_COMPRESSED = compressSpan(ALL_SPORTS_TYPES);

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
