"use client";

import { DBSchema, IDBPDatabase } from "idb";
import { SportType, Activity } from "@/lib/strava/types";
import { AggregatedIndexesSchema } from "@/types/activity-aggregation";
import { ActivityId } from "@/types/activity-selection";

export const ACTIVITY_STORES = {
  Activity: "activities",
  Metadata: "metadata",
} as const;

export const ACTIVITY_STORE = "activities";

export const ACTIVITY_INDEXES = {
  ID: "ID",
  TYPE: "TYPE",
  DATE: "DATE",
  TYPE_DATE: "TYPE_DATE",
};

export interface ActivityStoreSchema extends DBSchema {
  [ACTIVITY_STORE]: {
    // Stored rows are the app's own model, always complete (see @/lib/strava/types).
    value: Activity;
    key: ActivityId;
    indexes: {
      [ACTIVITY_INDEXES.ID]: ActivityId;
      [ACTIVITY_INDEXES.TYPE]: SportType;
      [ACTIVITY_INDEXES.DATE]: Date;
      [ACTIVITY_INDEXES.TYPE_DATE]: [string, Date];
    };
  };
}

export interface MetaDataSchema extends DBSchema {
  [ACTIVITY_STORES.Metadata]: {
    key: string;
    value: string;
  };
}

export type ActivityDatabaseSchema = DBSchema &
  ActivityStoreSchema &
  MetaDataSchema &
  AggregatedIndexesSchema;

export type ActivityDatabase = IDBPDatabase<ActivityDatabaseSchema>;
