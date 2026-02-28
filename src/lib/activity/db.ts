"use client";

import { deleteDB, openDB } from "idb";
import {
  ACTIVITY_STORES,
  ActivityDatabase,
  ActivityDatabaseSchema,
} from "@/lib/activity/activity-schema";

import { ApiType } from "@/lib/auth/api-types";

import {
  dbUpgradeRegistry,
  subscribeToActivityDbUpgrade,
} from "@/lib/activity/register-db-extensions";

function getDatabaseName(apiType: ApiType) {
  return `${apiType.toLowerCase()}-data-db`;
}

export async function openActivityDatabase(
  dataOrigin: ApiType,
): Promise<ActivityDatabase> {
  return openDB<ActivityDatabaseSchema>(getDatabaseName(dataOrigin), 1, {
    upgrade(db) {
      dbUpgradeRegistry.callbacks.forEach((callback) => callback(db));
    },
  });
}

subscribeToActivityDbUpgrade((db) => {
  db.createObjectStore(ACTIVITY_STORES.Metadata);
});

export async function getMetaData<T>(
  db: ActivityDatabase,
  key: string,
): Promise<T | undefined> {
  return db
    .get(ACTIVITY_STORES.Metadata, key)
    .then((value) => (!value ? undefined : JSON.parse(value)));
}

export async function setMetaData<T>(
  db: ActivityDatabase,
  key: string,
  value: T,
): Promise<void> {
  await db.put(ACTIVITY_STORES.Metadata, JSON.stringify(value), key);
}

export async function deleteMetaData(
  db: ActivityDatabase,
  key: string,
): Promise<void> {
  await db.delete(ACTIVITY_STORES.Metadata, key);
}

export async function deleteActivityDatabase(
  dataOrigin: ApiType,
): Promise<void> {
  await deleteDB(getDatabaseName(dataOrigin));
}

export async function deleteActivityDatabases(): Promise<void> {
  await Promise.all(
    [ApiType.Strava, ApiType.Demo].map((type) => deleteActivityDatabase(type)),
  );
}

export function deleteAllOrigins() {
  return deleteActivityDatabases();
}
