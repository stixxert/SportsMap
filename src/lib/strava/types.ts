/**
 * The single entry point for Strava domain types, and the app's own activity model.
 *
 * The app does not store Strava's wire format: rows in IndexedDB are this `Activity`
 * shape — camelCase, with a real `Date` for `startDate` (the date index and every filter
 * comparison depend on that). The wire → domain mapping happens once, in the client
 * (`@/lib/strava/client`), which is the only module that knows about snake_case.
 *
 * Strava's raw payload types remain available as `WireActivity` / `WireAthlete` for that
 * mapping, generated from the committed schema (see scripts/generate-strava-schema.mjs).
 */
import type { components } from "@/src/generated/strava-schema";
import type { SportType as SportTypeName } from "@/src/generated/strava-sport-types";

export { SportType } from "@/src/generated/strava-sport-types";

type Schemas = components["schemas"];

/** Raw `GET /athlete/activities` row, exactly as Strava sends it. */
export type WireActivity = Schemas["SummaryActivity"];
/** Raw `GET /athlete` payload, exactly as Strava sends it. */
export type WireAthlete = Schemas["DetailedAthlete"];

export interface ActivityMap {
  id?: string;
  polyline?: string;
  summaryPolyline?: string;
}

/** The activity shape this app stores, renders, filters and aggregates. */
export interface Activity {
  id: number;
  name?: string;
  sportType: SportTypeName;
  distance?: number;
  totalElevationGain?: number;
  movingTime?: number;
  /** Always a Date: IndexedDB's DATE index and key ranges rely on it. */
  startDate: Date;
  map?: ActivityMap;
}

/** The subset of the athlete profile this app displays and geocodes from. */
export interface AthleteProfile {
  id?: number;
  firstname?: string;
  lastname?: string;
  profile?: string;
  profileMedium?: string;
  city?: string;
  state?: string;
  country?: string;
}
