import { SportType } from "@/lib/strava/types";

/**
 * Compresses a sport-type selection into a stable string, used as part of the aggregate
 * cache key and for comparing two selections.
 *
 * Names are used directly (sorted, comma-joined) rather than indexes into the SportType
 * enum. The previous index encoding silently broke whenever Strava added a sport type —
 * the indexes shifted, so already-stored aggregates decoded to the *wrong* sports, and a
 * newly added type compressed to "-1" and was dropped entirely.
 */
const SPAN_DELIMITER = ",";

export type CompressedTypeSpan = string;

const KNOWN_TYPES = new Set<string>(Object.values(SportType));

export function compressSpan(
  span: SportType[] | SportType,
): CompressedTypeSpan {
  const types = Array.isArray(span) ? span : [span];

  // Sort a copy: mutating the caller's filter array has bitten this app before.
  return [...types].sort().join(SPAN_DELIMITER);
}

export function uncompressSpan(
  compressedSpan: CompressedTypeSpan,
): SportType | SportType[] | undefined {
  const results = compressedSpan
    .split(SPAN_DELIMITER)
    /* drop anything that is not a known sport type (stale or foreign keys) */
    .filter((value) => KNOWN_TYPES.has(value)) as SportType[];

  if (results.length === 0) return undefined;

  if (results.length === 1) return results[0];

  return results;
}
