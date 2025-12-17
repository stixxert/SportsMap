import { fetchByPagination } from "@testing/fetch-pagination";
import { ActivitiesApi, Configuration } from "@/strava-api";

import {
  findUninsertedActivities,
  getAllActivities,
  MAX_PAGE_SIZE,
} from "../lib/activity-sync";

const fetchFunction = (activities: unknown[]) =>
  jest.fn(async (url) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(fetchByPagination(url, activities)),
    }),
  ) as jest.Mock;

test("synchronize: all activities", async () => {
  const activities = Array.from({ length: 2000 }, (_, i) => ({
    id: i,
  }));

  global.fetch = fetchFunction(activities);

  const apiConfiguration = new Configuration();

  const activityApi = new ActivitiesApi(apiConfiguration);

  const retrievedActivities = await getAllActivities(activityApi);

  const reducedActivities = retrievedActivities.map((activity) => ({
    id: activity.id,
  }));

  expect(reducedActivities).toEqual(activities);
});

test("synchronize: partial activities, clean per page break", async () => {
  const apiConfiguration = new Configuration();
  const activityApi = new ActivitiesApi(apiConfiguration);

  let activities = Array.from({ length: MAX_PAGE_SIZE * 10 }, (_, i) => ({
    id: i,
  }));

  global.fetch = fetchFunction(activities);

  const lastActivityFirstPass = activities[activities.length - 1];

  const secondPassActivities = Array.from(
    { length: MAX_PAGE_SIZE * 10 },
    (_, i) => ({
      id: activities.length + i,
    }),
  );

  activities = [...secondPassActivities.reverse(), ...activities.reverse()];

  global.fetch = fetchFunction(activities);

  const retrievedActivities = await findUninsertedActivities(
    lastActivityFirstPass,
    activityApi,
  );

  const reducedActivities = retrievedActivities.map((activity) => ({
    id: activity.id,
  }));

  expect(reducedActivities).toEqual(secondPassActivities);
});

test("synchronize: partial activities, uneven per page break", async () => {
  const apiConfiguration = new Configuration();
  const activityApi = new ActivitiesApi(apiConfiguration);

  let activities = Array.from({ length: MAX_PAGE_SIZE }, (_, i) => ({
    id: i,
  }));

  global.fetch = fetchFunction(activities);

  const lastActivityFirstPass = activities[activities.length - 1];

  const secondPassActivities = Array.from(
    { length: MAX_PAGE_SIZE / 2 },
    (_, i) => ({
      id: activities.length + i,
    }),
  );

  activities = [...secondPassActivities.reverse(), ...activities.reverse()];

  global.fetch = fetchFunction(activities);

  const retrievedActivities = await findUninsertedActivities(
    lastActivityFirstPass,
    activityApi,
  );

  const reducedActivities = retrievedActivities.map((activity) => ({
    id: activity.id,
  }));

  expect(reducedActivities).toEqual(secondPassActivities);
});
