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

/**
 * One connection per data origin.
 *
 * Callers used to open a fresh `openDB` connection per query — the search worker, the
 * map view and single-activity lookups each did it — which churns connections and
 * repeats the (synchronous) upgrade checks on the hot path of every map interaction.
 */
const connections = new Map<ApiType, Promise<ActivityDatabase>>();

export function openActivityDatabase(
  dataOrigin: ApiType,
): Promise<ActivityDatabase> {
  const existing = connections.get(dataOrigin);

  if (existing) return existing;

  const opened = openDB<ActivityDatabaseSchema>(
    getDatabaseName(dataOrigin),
    1,
    {
      upgrade(db) {
        dbUpgradeRegistry.callbacks.forEach((callback) => callback(db));
      },
    },
  );

  connections.set(dataOrigin, opened);

  // A failed open must not poison the cache.
  opened.catch(() => connections.delete(dataOrigin));

  return opened;
}

/** Closes and forgets the cached connection (used by tests and by deletes). */
export async function closeActivityDatabase(
  dataOrigin: ApiType,
): Promise<void> {
  const existing = connections.get(dataOrigin);

  connections.delete(dataOrigin);

  if (!existing) return;

  const db = await existing.catch(() => undefined);

  db?.close();
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
  await closeActivityDatabase(dataOrigin);
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
