"use client";

import { ActivitiesApi, Configuration, SummaryActivity } from "@/strava-api";
import { addActivities } from "@/features/activity/lib/store-actions";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { openActivityDatabase } from "@/lib/activity/db";
import { generateNumActivities } from "@/lib/demo-data/activity-generation";
import {
  ACTIVITY_INDEXES,
  ACTIVITY_STORES,
} from "@/lib/activity/activity-schema";

import { ApiType } from "@/lib/auth/api-types";

export const MAX_PAGE_SIZE = 200;
export const SYNC_TIME_THRESHOLD = 1000 * 60 * 60; // 1 hr

export async function synchronizeActivities(
  apiType: ApiType,
  apiConfiguration: Configuration,
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

  if (!apiConfiguration) {
    throw new Error("No API configuration found");
  }

  setActivitiesSynced(false);

  const activitiesApi = new ActivitiesApi(apiConfiguration);

  const db = await openActivityDatabase(apiType);

  const activityStore = db.transaction(
    ACTIVITY_STORES.Activity,
    "readonly",
  ).store;

  const index = activityStore.index(ACTIVITY_INDEXES.DATE);

  const cursor = await index.openCursor(null, "prev");

  let insertActivities: SummaryActivity[] = [];

  if (apiType !== ApiType.Demo) {
    if (cursor) {
      // DB has some or all activities
      const lastActivity = cursor.value as SummaryActivity;

      insertActivities = await findUninsertedActivities(
        lastActivity,
        activitiesApi,
      );
    } else {
      // DB has no activities
      insertActivities = await getAllActivities(activitiesApi);
    }
  } else {
    if (!cursor) {
      insertActivities = generateNumActivities(1000, 0, {
        start: new Date(0),
        end: new Date(Date.now()),
      });
    }
  }

  await addActivities(db, insertActivities);

  useActivityMetadataStore.getState().setMetaData({ lastSync: new Date() });

  setActivitiesSynced(true);
}

export async function getAllActivities(
  api: ActivitiesApi,
): Promise<SummaryActivity[]> {
  const params = {
    page: 1,
    perPage: MAX_PAGE_SIZE,
  };

  let allActivities: SummaryActivity[] = [];

  while (true) {
    const activities = await api.getLoggedInAthleteActivities(params);

    allActivities = allActivities.concat(activities);

    // Page length == 0 or < pageSize, means that there are no more activities than this.
    if (activities.length === 0 || activities.length < params.perPage) {
      break;
    }

    params.page++;
  }

  return allActivities;
}

export async function findUninsertedActivities(
  lastInserted: SummaryActivity,
  api: ActivitiesApi,
): Promise<SummaryActivity[]> {
  const params = {
    page: 1,
    perPage: 30,
  };

  let uninsertedActivities: SummaryActivity[] = [];

  while (true) {
    const activities = await api.getLoggedInAthleteActivities(params);

    if (activities.length === 0) break;

    const foundIndex = activities.findIndex(
      (activity) => activity.id === lastInserted.id,
    );

    if (foundIndex >= 0) {
      uninsertedActivities = uninsertedActivities.concat(
        activities.slice(0, foundIndex),
      );

      break;
    } else {
      // Increase page size to 100, then start adding old elements
      if (params.perPage < MAX_PAGE_SIZE) {
        params.perPage = MAX_PAGE_SIZE;

        // Do fetch again.
        continue;
      }
      uninsertedActivities = uninsertedActivities.concat(activities);
      params.page++;
    }
  }

  return uninsertedActivities;
}
