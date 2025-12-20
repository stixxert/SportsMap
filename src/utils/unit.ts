/*
 * returns: duration in DD d HH h MM m or MM m SS s,
 * the latter if duration does not span days.
 */
export function durationToTimeString(duration: number) {
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

  if (days) parts.push(String(days).concat("d"));

  if (hours) parts.push(String(hours).concat("h"));

  if (minutes) parts.push(String(minutes).concat("m"));

  if (seconds && !days && !hours) parts.push(String(seconds).concat("s"));

  return parts.join(" ");
}

/* dist <= 1 KM gets M format, dist > KM gets KM*/
export function formatDistance(distance: number) {
  if (distance <= 1000) {
    return `${distance} m`;
  }

  return (distance / 1000).toFixed(1);
}
