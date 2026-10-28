"use client";

import { addActivities } from "@/features/activity/lib/store-actions";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { openActivityDatabase } from "@/lib/activity/db";
import { generateNumActivities } from "@/lib/demo-data/activity-generation";
import {
  ACTIVITY_INDEXES,
  ACTIVITY_STORES,
} from "@/lib/activity/activity-schema";
import { useStravaClientStore } from "@/lib/auth/api-store";
import { syncAccessToken } from "@/lib/auth/api-configuration";
import {
  isUnauthorized,
  type ActivityPage,
  type StravaClient,
} from "@/lib/strava/client";
import type { Activity } from "@/lib/strava/types";

import { ApiType } from "@/lib/auth/api-types";

export const MAX_PAGE_SIZE = 200;
export const SYNC_TIME_THRESHOLD = 1000 * 60 * 60; // 1 hr

/**
 * The slice of the client this module needs. Keeping it as an interface means the paging
 * logic is testable without constructing a client, a token, or a network layer.
 */
export type ActivityLister = Pick<StravaClient, "listActivities">;

export async function synchronizeActivities(
  apiType: ApiType,
  client: StravaClient | null,
  forceSync?: boolean,
): Promise<void> {
  const metaData = useActivityMetadataStore.getState().metaData;

  const setActivitiesSynced = useActivitySyncStore.getState().setActivitiesSync;

  if (!metaData) {
    throw Error("Attempting to synchronize without sync metadata");
  }

  if (
    new Date(metaData.lastSync) >
      new Date(new Date().getTime() - SYNC_TIME_THRESHOLD) &&
    !forceSync
  ) {
    if (!useActivitySyncStore.getState().activitiesSync)
      setActivitiesSynced(true);
    return;
  }

  if (apiType === ApiType.Strava && !client) {
    throw new Error("No Strava client available to synchronize activities");
  }

  setActivitiesSynced(false);

  const db = await openActivityDatabase(apiType);

  const activityStore = db.transaction(
    ACTIVITY_STORES.Activity,
    "readonly",
  ).store;

  const index = activityStore.index(ACTIVITY_INDEXES.DATE);

  const cursor = await index.openCursor(null, "prev");

  let insertActivities: Activity[] = [];

  if (apiType === ApiType.Demo) {
    if (!cursor) {
      insertActivities = generateNumActivities(1000, 0, {
        start: new Date(0),
        end: new Date(Date.now()),
      });
    }
  } else if (client) {
    insertActivities = cursor
      ? // DB has some activities: fetch only what is newer than the newest stored one.
        await findUninsertedActivities(cursor.value as Activity, client)
      : await getAllActivities(client);
  }

  await addActivities(db, insertActivities);

  useActivityMetadataStore.getState().setMetaData({ lastSync: new Date() });

  setActivitiesSynced(true);
}

/**
 * One paged read, refreshing the access token and retrying exactly once if it turns out to
 * be stale. A 401 must never be treated as "log the user out": the local database is the
 * user's only copy of their history, so wiping it on a recoverable error is data loss.
 */
async function listPage(
  client: ActivityLister,
  params: { page: number; perPage: number },
): Promise<{ page: ActivityPage; client: ActivityLister }> {
  try {
    return { page: await client.listActivities(params), client };
  } catch (error) {
    if (!isUnauthorized(error)) throw error;

    await syncAccessToken();

    const refreshed = useStravaClientStore.getState().client;

    if (!refreshed) throw error;

    // Return the refreshed client so the rest of the run stops paying a 401 per page.
    return { page: await refreshed.listActivities(params), client: refreshed };
  }
}

export async function getAllActivities(
  client: ActivityLister,
): Promise<Activity[]> {
  const params = {
    page: 1,
    perPage: MAX_PAGE_SIZE,
  };

  let allActivities: Activity[] = [];
  let active: ActivityLister = client;

  while (true) {
    const result = await listPage(active, params);

    active = result.client;
    allActivities = allActivities.concat(result.page.activities);

    // Terminate on what Strava SENT, not on how many rows we could map: one unmappable
    // row would otherwise make a full page look like the end of history and silently
    // truncate the sync.
    if (result.page.received === 0 || result.page.received < params.perPage) {
      break;
    }

    params.page++;
  }

  return allActivities;
}

export async function findUninsertedActivities(
  lastInserted: Activity,
  client: ActivityLister,
): Promise<Activity[]> {
  const params = {
    page: 1,
    perPage: 30,
  };

  let uninsertedActivities: Activity[] = [];
  let active: ActivityLister = client;

  while (true) {
    const result = await listPage(active, params);

    active = result.client;

    // Terminate on what Strava SENT, not on how many rows could be mapped.
    if (result.page.received === 0) break;

    const pageActivities = result.page.activities;

    const foundIndex = pageActivities.findIndex(
      (activity) => activity.id === lastInserted.id,
    );

    if (foundIndex >= 0) {
      uninsertedActivities = uninsertedActivities.concat(
        pageActivities.slice(0, foundIndex),
      );

      break;
    } else {
      // Widen the page, then start paging back through history.
      if (params.perPage < MAX_PAGE_SIZE) {
        params.perPage = MAX_PAGE_SIZE;

        continue;
      }
      uninsertedActivities = uninsertedActivities.concat(pageActivities);
      params.page++;
    }
  }

  return uninsertedActivities;
}
