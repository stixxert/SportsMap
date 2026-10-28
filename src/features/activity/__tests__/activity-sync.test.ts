import { beforeEach, expect, test, vi } from "vitest";

import { fetchByPagination } from "@/testing/fetch-pagination";
import { createStravaClient } from "@/lib/strava/client";

import {
  findUninsertedActivities,
  getAllActivities,
  MAX_PAGE_SIZE,
} from "../lib/activity-sync";
import { SportType, type Activity, type WireActivity } from "@/lib/strava/types";

/** API payload rows, in Strava's wire format (the client maps these to `Activity`). */
const row = (id: number): WireActivity => ({
  id,
  sport_type: "Ride",
  start_date: "2020-01-01T00:00:00Z",
});

/** The already-stored row the incremental sync searches for. */
const storedRow = (id: number): Activity => ({
  id,
  sportType: SportType.Ride,
  startDate: new Date(0),
});

/** A client whose transport serves a fixed activity list, paged like Strava does. */
function clientServing(activities: unknown[]) {
  const transport = async (url: string | URL | Request) =>
    ({
      ok: true,
      status: 200,
      json: async () => fetchByPagination(String(url), activities),
      text: async () => "",
    }) as unknown as Response;

  return createStravaClient({
    accessToken: "test-token",
    transport: transport as unknown as typeof fetch,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

test("synchronize: all activities", async () => {
  const activities = Array.from({ length: 2000 }, (_, i) => row(i));

  const retrievedActivities = await getAllActivities(
    clientServing(activities),
  );

  expect(retrievedActivities.map((activity) => activity.id)).toEqual(
    activities.map((activity) => activity.id),
  );
});

test("synchronize: partial activities, clean per page break", async () => {
  const stored = Array.from({ length: MAX_PAGE_SIZE * 10 }, (_, i) => row(i));

  const lastStored = storedRow(stored[stored.length - 1].id ?? 0);

  const fresh = Array.from({ length: MAX_PAGE_SIZE * 10 }, (_, i) => row(stored.length + i));

  // Strava returns newest-first, so the stored history comes last.
  const activities = [...fresh.slice().reverse(), ...stored.slice().reverse()];

  const retrievedActivities = await findUninsertedActivities(
    lastStored,
    clientServing(activities),
  );

  // Strava pages newest-first, so the unsynced window arrives in that order.
  expect(retrievedActivities.map((activity) => activity.id)).toEqual(
    fresh
      .slice()
      .reverse()
      .map((activity) => activity.id),
  );
});

test("synchronize: partial activities, uneven per page break", async () => {
  const stored = Array.from({ length: MAX_PAGE_SIZE }, (_, i) => row(i));

  const lastStored = storedRow(stored[stored.length - 1].id ?? 0);

  const fresh = Array.from({ length: MAX_PAGE_SIZE / 2 }, (_, i) => row(stored.length + i));

  const activities = [...fresh.slice().reverse(), ...stored.slice().reverse()];

  const retrievedActivities = await findUninsertedActivities(
    lastStored,
    clientServing(activities),
  );

  // Strava pages newest-first, so the unsynced window arrives in that order.
  expect(retrievedActivities.map((activity) => activity.id)).toEqual(
    fresh
      .slice()
      .reverse()
      .map((activity) => activity.id),
  );
});
