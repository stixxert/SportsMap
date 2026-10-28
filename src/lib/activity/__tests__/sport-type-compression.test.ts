import { describe, expect, test } from "vitest";

import {
  compressSpan,
  uncompressSpan,
} from "@/lib/activity/sport-type-compression";
import { SportType } from "@/lib/strava/types";

describe("sport type compression", () => {
  test("round-trips a single type and a list", () => {
    expect(uncompressSpan(compressSpan(SportType.Ride))).toBe(SportType.Ride);

    // The encoded form is sorted, so the round-trip comes back sorted.
    const span = [SportType.Run, SportType.Ride];
    expect(uncompressSpan(compressSpan(span))).toEqual([
      SportType.Ride,
      SportType.Run,
    ]);
  });

  test("is order-insensitive, so equal selections share a cache key", () => {
    expect(compressSpan([SportType.Run, SportType.Ride])).toBe(
      compressSpan([SportType.Ride, SportType.Run]),
    );
  });

  test("does not mutate the caller's array", () => {
    const span = [SportType.Run, SportType.Ride];
    compressSpan(span);
    expect(span).toEqual([SportType.Run, SportType.Ride]);
  });

  test("keeps working when Strava adds a sport type", () => {
    // The previous index-based encoding shifted every index when the enum grew, so a
    // stored span decoded to the wrong sports — and a new type encoded to "-1".
    expect(compressSpan(["NewSportFromStrava" as SportType])).toBe(
      "NewSportFromStrava",
    );

    // Unknown names survive compression but are dropped on read.
    expect(uncompressSpan("Ride,NewSportFromStrava")).toBe(SportType.Ride);
  });

  test("returns undefined for an empty or unrecognised span", () => {
    expect(uncompressSpan(compressSpan([]))).toBeUndefined();
    expect(uncompressSpan("nope")).toBeUndefined();
  });
});
