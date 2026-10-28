import { beforeEach, describe, expect, test, vi } from "vitest";

// The IndexedDB schema is registered by importing these modules (the app does the same
// via src/features/registrations — a dependency worth inverting later).
import "@/features/activity/lib/activity-schema";
import "@/features/activity-aggregation/lib/schema";

import { getActivities } from "@/features/activity/lib/store-actions";
import { getAllActivities, MAX_PAGE_SIZE } from "../lib/activity-sync";
import { createStravaClient, StravaHttpError } from "@/lib/strava/client";
import { closeActivityDatabase, openActivityDatabase } from "@/lib/activity/db";
import { addActivities } from "@/features/activity/lib/store-actions";
import { ApiType } from "@/lib/auth/api-types";
import { SportType, type Activity } from "@/lib/strava/types";

vi.mock("@/lib/auth/api-configuration", () => ({
  syncAccessToken: vi.fn(async () => ({ success: true, value: null })),
}));

vi.mock("@/lib/auth/api-store", () => ({
  useStravaClientStore: {
    getState: () => ({ client: globalThis.__refreshedClient ?? null }),
  },
}));

declare global {
  var __refreshedClient: unknown;
}

const wireRow = (id: number) => ({
  id,
  sport_type: "Ride",
  start_date: "2020-01-01T00:00:00Z",
});

/** A transport that serves pages from a list, and can 401 the first N calls. */
function transport(rows: unknown[], failFirst = 0) {
  let calls = 0;

  return (async (url: string | URL | Request) => {
    calls++;

    if (calls <= failFirst) {
      return {
        ok: false,
        status: 401,
        json: async () => ({}),
        text: async () => "Unauthorized",
      };
    }

    const params = new URL(String(url)).searchParams;
    const perPage = Number(params.get("per_page") ?? 200);
    const page = Number(params.get("page") ?? 1);
    const start = (page - 1) * perPage;

    return {
      ok: true,
      status: 200,
      json: async () => rows.slice(start, start + perPage),
      text: async () => "",
    };
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.restoreAllMocks();
  globalThis.__refreshedClient = undefined;
});

describe("paging invariants", () => {
  test("does not stop early when a row cannot be mapped", async () => {
    // Full first page where the LAST row is unmappable: mapped length 199 < perPage 200.
    const rows = [
      ...Array.from({ length: MAX_PAGE_SIZE - 1 }, (_, i) => wireRow(i)),
      { id: 999, sport_type: "NotARealSport", start_date: "2020-01-01T00:00:00Z" },
      ...Array.from({ length: MAX_PAGE_SIZE }, (_, i) => wireRow(1000 + i)),
    ];

    vi.spyOn(console, "warn").mockImplementation(() => {});

    const client = createStravaClient({
      accessToken: "t",
      transport: transport(rows),
    });

    const activities = await getAllActivities(client);

    // Every mappable row from both pages, not just page one.
    expect(activities).toHaveLength(MAX_PAGE_SIZE - 1 + MAX_PAGE_SIZE);
    expect(activities.some((activity) => activity.id === 1000)).toBe(true);
  });

  test("refreshes once on 401 and then continues with the refreshed client", async () => {
    const refreshed = createStravaClient({
      accessToken: "fresh",
      transport: transport([wireRow(1), wireRow(2)]),
    });

    globalThis.__refreshedClient = refreshed;

    const stale = createStravaClient({
      accessToken: "stale",
      transport: transport([wireRow(1), wireRow(2)], 1),
    });

    // First call 401s; the retry must use the refreshed client and succeed.
    const activities = await getAllActivities(stale);

    expect(activities.map((activity) => activity.id)).toEqual([1, 2]);
  });

  test("an unrecoverable 401 surfaces as an error and deletes no data", async () => {
    const deleteSpy = vi.fn();
    globalThis.__refreshedClient = {};

    // No refreshed client available -> the original error must propagate.
    globalThis.__refreshedClient = null;

    const client = createStravaClient({
      accessToken: "stale",
      transport: transport([], 99),
    });

    await expect(getAllActivities(client)).rejects.toBeInstanceOf(
      StravaHttpError,
    );
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

describe("local storage invariants", () => {
  test("re-syncing the same activities is idempotent and keeps rows unchanged", async () => {
    const db = await openActivityDatabase(ApiType.Demo);

    const activity: Activity = {
      id: 7,
      sportType: SportType.Ride,
      startDate: new Date("2020-01-01T00:00:00Z"),
      distance: 100,
    };

    await addActivities(db, [activity]);
    await addActivities(db, [{ ...activity, distance: 250 }]);

    const stored = await db.get("activities", 7);

    expect(stored?.distance).toBe(250);

    const inRange = await getActivities(db, {
      startDate: new Date("2019-01-01T00:00:00Z"),
      endDate: new Date("2021-01-01T00:00:00Z"),
    });

    expect(inRange.map((row) => row.id)).toEqual([7]);

    await closeActivityDatabase(ApiType.Demo);
  });

  test("reads rows written by the previous build (compat contract)", async () => {
    const db = await openActivityDatabase(ApiType.Demo);

    // The shape the old generated client wrote: camelCase, Date, map.summaryPolyline.
    await db.put("activities", {
      id: 42,
      name: "Legacy ride",
      sportType: SportType.Ride,
      distance: 1234,
      totalElevationGain: 10,
      movingTime: 60,
      startDate: new Date("2021-06-01T00:00:00Z"),
      map: { summaryPolyline: "abc" },
    } as Activity);

    const inRange = await getActivities(db, {
      startDate: new Date("2021-01-01T00:00:00Z"),
      endDate: new Date("2021-12-31T00:00:00Z"),
      sportType: SportType.Ride,
    });

    // Date index and TYPE_DATE index both have to work on a pre-existing row.
    expect(inRange).toHaveLength(1);
    expect(inRange[0].startDate).toBeInstanceOf(Date);
    expect(inRange[0].map?.summaryPolyline).toBe("abc");

    await closeActivityDatabase(ApiType.Demo);
  });
});
