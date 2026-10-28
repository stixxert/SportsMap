import type {
  Activity,
  AthleteProfile,
  WireActivity,
  WireAthlete,
} from "@/lib/strava/types";
import { SportType } from "@/lib/strava/types";

const KNOWN_SPORT_TYPES = new Set<string>(Object.values(SportType));

/**
 * Strava wire row → the app's own activity model.
 *
 * Returns `undefined` for a row that cannot be represented faithfully (no id, no usable
 * start date, or a sport type this build does not know). Dropping and counting such a
 * row beats inventing a value: the date index and every filter expect a real `Date`, and
 * a fabricated sport type would pollute the aggregation cache keys.
 */
export function toActivity(wire: WireActivity): Activity | undefined {
  if (typeof wire.id !== "number") return undefined;
  if (!wire.start_date) return undefined;

  const startDate = new Date(wire.start_date);
  if (Number.isNaN(startDate.getTime())) return undefined;

  if (!wire.sport_type || !KNOWN_SPORT_TYPES.has(wire.sport_type)) {
    return undefined;
  }

  return {
    id: wire.id,
    name: wire.name,
    sportType: wire.sport_type as Activity["sportType"],
    distance: wire.distance,
    totalElevationGain: wire.total_elevation_gain,
    movingTime: wire.moving_time,
    startDate,
    map: wire.map
      ? {
          id: wire.map.id,
          polyline: wire.map.polyline,
          summaryPolyline: wire.map.summary_polyline,
        }
      : undefined,
  };
}

export function toAthleteProfile(wire: WireAthlete): AthleteProfile {
  return {
    id: wire.id,
    firstname: wire.firstname,
    lastname: wire.lastname,
    profile: wire.profile,
    profileMedium: wire.profile_medium,
    city: wire.city,
    state: wire.state,
    country: wire.country,
  };
}
