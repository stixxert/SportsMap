import { describe, expect, test, vi } from "vitest";

import { createStravaClient, StravaHttpError } from "@/lib/strava/client";

/** Captures the URL a client call produces and returns a canned body. */
function recordingClient(body: unknown = []) {
  const calls: { url: string; init?: RequestInit }[] = [];

  const transport = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return { ok: true, status: 200, json: async () => body, text: async () => "" };
  }) as unknown as typeof fetch;

  return {
    calls,
    client: createStravaClient({ accessToken: "abc123", transport }),
  };
}

describe("strava client", () => {
  test("keeps the /api/v3 path prefix when building URLs", async () => {
    const { calls, client } = recordingClient();

    await client.listActivities({ page: 2, perPage: 50 });

    // A leading slash in the path would make `new URL` discard /api/v3 entirely.
    expect(calls[0].url).toBe(
      "https://www.strava.com/api/v3/athlete/activities?page=2&per_page=50",
    );
  });

  test("sends the bearer token and omits undefined params", async () => {
    const { calls, client } = recordingClient();

    await client.listActivities({ after: 1700000000 });

    expect(calls[0].init?.headers).toEqual({ Authorization: "Bearer abc123" });
    expect(calls[0].url).not.toContain("before=");
    expect(calls[0].url).toContain("after=1700000000");
  });

  test("maps wire rows (snake_case, ISO dates) to the app's Activity model", async () => {
    const { client } = recordingClient([
      {
        id: 42,
        name: "Morning Ride",
        sport_type: "Ride",
        distance: 1234.5,
        total_elevation_gain: 210,
        moving_time: 3600,
        start_date: "2024-05-01T06:30:00Z",
        map: { summary_polyline: "abc" },
      },
    ]);

    const { activities, received } = await client.listActivities();

    expect(received).toBe(1);

    const [activity] = activities;

    expect(activity).toEqual({
      id: 42,
      name: "Morning Ride",
      sportType: "Ride",
      distance: 1234.5,
      totalElevationGain: 210,
      movingTime: 3600,
      startDate: new Date("2024-05-01T06:30:00Z"),
      map: { id: undefined, polyline: undefined, summaryPolyline: "abc" },
    });
    expect(activity.startDate).toBeInstanceOf(Date);
  });

  test("drops rows it cannot represent instead of inventing values", async () => {
    const { client } = recordingClient([
      { id: 1, sport_type: "Ride", start_date: "2024-05-01T00:00:00Z" },
      { id: 2, sport_type: "NotARealSport", start_date: "2024-05-01T00:00:00Z" },
      { id: 3, sport_type: "Ride" },
    ]);

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { activities, received } = await client.listActivities();

    expect(activities.map((activity) => activity.id)).toEqual([1]);
    // `received` counts what Strava sent, so paging does not stop early when rows drop.
    expect(received).toBe(3);
    expect(warn).toHaveBeenCalledOnce();
  });

  test("raises a typed error on a non-2xx response", async () => {
    const transport = (async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => "Unauthorized",
    })) as unknown as typeof fetch;

    const client = createStravaClient({ accessToken: "expired", transport });

    await expect(client.getAthlete()).rejects.toBeInstanceOf(StravaHttpError);
  });
});
