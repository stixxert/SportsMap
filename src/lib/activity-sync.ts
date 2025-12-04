import { ActivitiesApi, SummaryActivity } from "@/strava-api";
import {
  ACTIVITY_STORE_NAME,
  ActivityDB,
  addActivities,
} from "@lib/activity-db";

export async function synchronizeUsingApi(
  storeDb: ActivityDB,
  api: ActivitiesApi,
): Promise<void> {
  const activityStore = storeDb.transaction(
    ACTIVITY_STORE_NAME,
    "readonly",
  ).store;

  const cursor = await activityStore.openCursor(undefined, "prev");

  let insertActivities: SummaryActivity[];

  if (cursor) {
    // DB has some or all activities
    const lastActivity = cursor.value as SummaryActivity;

    insertActivities = await findUninsertedActivities(lastActivity, api);
  } else {
    // DB has no activities
    insertActivities = await getAllActivities(api);
  }

  return addActivities(storeDb, insertActivities);
}

async function getAllActivities(
  api: ActivitiesApi,
): Promise<SummaryActivity[]> {
  const params = {
    page: 1,
    perPage: 1000,
  };

  let allActivities: SummaryActivity[] = [];

  while (true) {
    const activities = await api.getLoggedInAthleteActivities(params);

    allActivities = allActivities.concat(activities);

    // Page length == 0 or < pageSize, means that there are no more activities than this.
    if (activities.length === 0 || allActivities.length < params.perPage) {
      break;
    }
  }

  return allActivities;
}

async function findUninsertedActivities(
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

    const foundIndex = activities.findIndex(
      (activity) => activity.id === lastInserted.id,
    );

    if (foundIndex) {
      uninsertedActivities = uninsertedActivities.concat(
        activities.slice(0, foundIndex),
      );

      break;
    } else {
      // Increase page size to 100, then start adding old elements
      if (params.perPage < 100) {
        params.perPage = 100;

        // Do fetch again.
        continue;
      }
      uninsertedActivities = uninsertedActivities.concat(activities);
      params.page++;
    }
  }

  return uninsertedActivities;
}
