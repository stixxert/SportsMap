"use client";

import { ApiType } from "@/types/configuration-types";
import { DBSchema, deleteDB, IDBPDatabase, openDB } from "idb";
import { createSubscribeRegistry } from "@/lib/registry";
import { ActivityOriginSchema } from "@/features/registrations/schema";

const dbUpgradeRegistry = createSubscribeRegistry<ActivityDatabase>();

export const subscribeToActivityDbUpgrade = dbUpgradeRegistry.subscribe;

function getDatabaseName(apiType: ApiType) {
  return `${apiType.toLowerCase()}-data-db`;
}

export type ActivitySchema = ActivityOriginSchema & MetaDataSchema;

export type ActivityDatabase = IDBPDatabase<ActivitySchema>;

export async function openActivityDatabase(
  dataOrigin: ApiType,
): Promise<ActivityDatabase> {
  return openDB<ActivitySchema>(getDatabaseName(dataOrigin), 1, {
    upgrade(db) {
      dbUpgradeRegistry.callbacks.forEach((callback) => callback(db));
    },
  });
}

export const METADATA_STORE = "metadata";

export interface MetaDataSchema extends DBSchema {
  [METADATA_STORE]: {
    key: string;
    value: string;
  };
}

subscribeToActivityDbUpgrade((db) => {
  db.createObjectStore(METADATA_STORE);
});

export async function getMetaData<T>(
  db: ActivityDatabase,
  key: string,
): Promise<T | undefined> {
  return db
    .get(METADATA_STORE, key)
    .then((value) => (!value ? undefined : JSON.parse(value)));
}

export async function setMetaData<T>(
  db: ActivityDatabase,
  key: string,
  value: T,
): Promise<void> {
  await db.put(METADATA_STORE, JSON.stringify(value), key);
}

export async function deleteMetaData(
  db: ActivityDatabase,
  key: string,
): Promise<void> {
  await db.delete(METADATA_STORE, key);
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
