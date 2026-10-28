import type {
  Activity,
  AthleteProfile,
  WireActivity,
  WireAthlete,
} from "@/lib/strava/types";
import { toActivity, toAthleteProfile } from "@/lib/strava/from-wire";

// Rather than depending on a generated Swagger/OpenAPI client (or a hand-picked subset of
// one), we take only what we need: two endpoints, typed by the committed schema.

export const STRAVA_API_BASE = "https://www.strava.com/api/v3";

/** Strava's maximum page size for `GET /athlete/activities`. */
export const STRAVA_MAX_PAGE_SIZE = 200;

const REQUEST_TIMEOUT_MS = 15_000;

export class StravaHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Strava API responded ${status}`);
    this.name = "StravaHttpError";
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof StravaHttpError && error.status === 401;
}

export interface ListActivitiesOptions {
  page?: number;
  perPage?: number;
  /** Epoch seconds. Activities that started before this time. */
  before?: number;
  /** Epoch seconds. Activities that started after this time. */
  after?: number;
}

/**
 * One page of activities.
 *
 * `received` is how many rows Strava actually sent, which can exceed
 * `activities.length` because unmappable rows are dropped. Paging MUST terminate on
 * `received`, not on the mapped length: otherwise one dropped row makes a full page look
 * like the end of history and silently truncates the sync.
 */
export interface ActivityPage {
  activities: Activity[];
  received: number;
}

export interface StravaClient {
  /** `GET /athlete` — already mapped to the app's profile model. */
  getAthlete(): Promise<AthleteProfile>;
  /** `GET /athlete/activities` — one page, already mapped to `Activity` rows. */
  listActivities(options?: ListActivitiesOptions): Promise<ActivityPage>;
}

export function createStravaClient(options: {
  accessToken: string;
  baseUrl?: string;
  /** Injectable for tests; defaults to global fetch. */
  transport?: typeof fetch;
}): StravaClient {
  const baseUrl = (options.baseUrl ?? STRAVA_API_BASE).replace(/\/+$/, "");
  const transport = options.transport ?? fetch;

  async function get<T>(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) search.set(key, String(value));
    }

    const query = search.toString();
    // Leading slashes are stripped so a baseUrl with a path (…/api/v3) is preserved.
    const url = `${baseUrl}/${path.replace(/^\/+/, "")}${query ? `?${query}` : ""}`;

    const response = await transport(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${options.accessToken}` },
      // A hung upstream must not hang the paging loop (the token endpoints already
      // use the same deadline).
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new StravaHttpError(response.status, await response.text());
    }

    return (await response.json()) as T;
  }

  return {
    getAthlete: async () =>
      toAthleteProfile(await get<WireAthlete>("athlete")),

    listActivities: async (listOptions = {}) => {
      const {
        page = 1,
        perPage = STRAVA_MAX_PAGE_SIZE,
        before,
        after,
      } = listOptions;

      const wire = await get<WireActivity[]>("athlete/activities", {
        page,
        per_page: perPage,
        before,
        after,
      });

      // Wire → domain happens here and nowhere else.
      const mapped: Activity[] = [];
      let dropped = 0;

      for (const row of wire) {
        const activity = toActivity(row);
        if (activity) mapped.push(activity);
        else dropped++;
      }

      if (dropped > 0) {
        console.warn(
          `Skipped ${dropped} Strava ${dropped === 1 ? "activity" : "activities"} that could not be read (unknown sport type or missing start date)`,
        );
      }

      return { activities: mapped, received: wire.length };
    },
  };
}
