/*
 * returns: duration in DD d HH h MM m or MM m SS s,
 * the latter if duration does not span days.
 */
export function durationToTimeString(
  duration: number,
  options?: {
    days?: boolean;
    hours?: boolean;
    minutes?: boolean;
    seconds?: boolean;
    hoursIgnoreLowerUnitThreshold?: number;
  },
) {
  let durationRemaining = duration;

  const daysInSeconds = 60 * 60 * 24;
  const hoursInSeconds = 60 * 60;
  const minutesInSeconds = 60;

  const days = Math.floor(durationRemaining / daysInSeconds);
  durationRemaining = durationRemaining % daysInSeconds;

  const hours = Math.floor(durationRemaining / hoursInSeconds);
  durationRemaining = durationRemaining % hoursInSeconds;

  const minutes = Math.floor(durationRemaining / minutesInSeconds);
  durationRemaining = durationRemaining % minutesInSeconds;

  const seconds = durationRemaining;

  const parts = [];

  if (days && options?.days !== false) parts.push(String(days).concat("d"));

  // manually adjusting just for hours, to add days as hours. should this be done for lower units as well?
  if (options?.hours !== false && (hours || (!options?.days && days > 0))) {
    let adjustedHours = hours;
    if (options?.days === false) adjustedHours = adjustedHours + days * 24;
    parts.push(String(adjustedHours).concat("h"));

    if (
      options?.hoursIgnoreLowerUnitThreshold !== undefined &&
      options?.hoursIgnoreLowerUnitThreshold <= adjustedHours
    )
      return parts.join(" ");
  }

  if (minutes && options?.minutes !== false)
    parts.push(String(minutes).concat("m"));

  if (seconds && !days && !hours && options?.seconds !== false)
    parts.push(String(seconds).concat("s"));

  return parts.join(" ");
}

const defaultDistanceOptions = {
  bigUnitUseThreshold: -1,
  bigUnitExcludeDecimalThreshold: -1,
  smallUnitExcludeDecimalThreshold: -1,
};

/* dist <= 1 KM gets M format, dist > KM gets KM*/
export function formatDistance(
  distance: number,
  options?: Partial<typeof defaultDistanceOptions>,
) {
  const _options = options
    ? { ...defaultDistanceOptions, ...options }
    : defaultDistanceOptions;

  if (
    (_options.bigUnitUseThreshold == -1 && distance <= 1000) ||
    _options.bigUnitUseThreshold >= distance
  ) {
    let _distance: string;
    if (_options.smallUnitExcludeDecimalThreshold !== -1)
      _distance = distance.toFixed(0);
    else _distance = `${distance}`;

    return `${_distance}m`;
  }

  const bigUnitDistance = distance / 1000;

  let decimalAdjustedDistance: string;

  if (bigUnitDistance >= _options.bigUnitExcludeDecimalThreshold)
    decimalAdjustedDistance = bigUnitDistance.toFixed(0);
  else decimalAdjustedDistance = bigUnitDistance.toFixed(1);

  return `${decimalAdjustedDistance}km`;
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date) {
  return dateTimeFormatter.format(
    new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000),
  );
}
