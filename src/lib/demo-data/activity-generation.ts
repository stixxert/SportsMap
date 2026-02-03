import { encode, LatLngTuple } from "@googlemaps/polyline-codec";
import { generateRandomActivityMap } from "@/lib/demo-data/map-generation";
import { SportType, SummaryActivity } from "@/strava-api";
import { randomBetween, randomFromArray } from "@/utils/misc";

const DISTANCE_BOUNDS = [1000, 100000];
const ELEVATION_GAIN_BOUNDS = [10, 10000];

const START_DATE_BOUNDS = [new Date(0).getTime(), Date.now()];
const MOVING_TIME_BOUNDS = [60 * 10, 60 * 60 * 24 * 1.5];

const defaultOptions = {
  name: crypto.randomUUID(),
  id: randomBetween(0, Number.MAX_SAFE_INTEGER),
  sportType: randomFromArray(Object.keys(SportType)) as SportType,
  startDate: new Date(
    randomBetween(START_DATE_BOUNDS[0], START_DATE_BOUNDS[1]),
  ),
  movingTime: randomBetween(MOVING_TIME_BOUNDS[0], MOVING_TIME_BOUNDS[1]),
};

export function generateActivity(
  options?: Partial<typeof defaultOptions>,
): SummaryActivity {
  const { name, id, sportType, startDate, movingTime } = Object.assign(
    {},
    defaultOptions,
    options ? options : {},
  );

  const _map = generateRandomActivityMap({
    radiusInMeters: randomBetween(DISTANCE_BOUNDS[0], DISTANCE_BOUNDS[1] / 10),
  });

  const map = {
    id: crypto.randomUUID(),
    summaryPolyline: encode(_map.map as LatLngTuple[]),
  };

  const distance = randomBetween(DISTANCE_BOUNDS[0], DISTANCE_BOUNDS[1]);

  const totalElevationGain = randomBetween(
    ELEVATION_GAIN_BOUNDS[0],
    ELEVATION_GAIN_BOUNDS[1],
  );

  return {
    name,
    id,
    sportType,
    distance,
    totalElevationGain,
    map,
    startDate,
    movingTime,
  };
}

export function generateNumActivities(
  numActivities: number,
  startIndex?: number,
  dateBounds?: { start?: Date; end?: Date },
) {
  return Array.from({ length: numActivities }).map((_, index) => {
    const adjustedIndex = (startIndex ?? 0) + index;

    let startDate: Date | undefined = undefined;

    if (dateBounds) {
      if (dateBounds.start) {
        if (dateBounds.end) {
          startDate = new Date(
            randomBetween(dateBounds.start.getTime(), dateBounds.end.getTime()),
          );
        } else {
          startDate = new Date(
            randomBetween(dateBounds.start.getTime(), START_DATE_BOUNDS[1]),
          );
        }
      } else if (dateBounds.end) {
        startDate = new Date(
          randomBetween(START_DATE_BOUNDS[0], dateBounds.end.getTime()),
        );
      }
    }

    return generateActivity({
      name: `Activity ${adjustedIndex}`,
      id: adjustedIndex,
      startDate,
    });
  });
}
