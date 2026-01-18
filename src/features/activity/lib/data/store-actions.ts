"use client";

import { SportType, SummaryActivity } from "@/strava-api";
import {
  constructDiscreteKeyBound,
  constructKeyBound,
  MAX_UPPER_BOUND,
  MIN_LOWER_BOUNDS,
} from "@/utils/db";
import { ACTIVITY_STORE, INDEXES } from "@/features/activity/lib/data/schema";
import { ActivityDatabase } from "@/lib/db/origin-related-activity-db";

export type ActivitySelectionOptions = {
  startDate?: Date;
  endDate?: Date;
  sportType?: SportType | SportType[];
};

export async function addActivities(
  db: ActivityDatabase,
  activities: SummaryActivity[],
): Promise<void> {
  const tx = db.transaction(ACTIVITY_STORE, "readwrite");

  const addActivitiesPromises = activities.map(async (activity) => {
    await tx.store.add(activity);
  });

  await Promise.all([...addActivitiesPromises, tx.done]);
}

export function constructSelectionOptionsKeyRange(
  selectionOptions: ActivitySelectionOptions,
) {
  const { sportType, startDate, endDate } = selectionOptions;

  function dateProcedure(lower: string, upper: string | unknown[]) {
    if (startDate) {
      if (endDate)
        return constructKeyBound({
          start: [lower, startDate],
          end: [upper, endDate],
        });

      return constructKeyBound({
        start: [lower, startDate],
        end: [upper, MAX_UPPER_BOUND],
      });
    }

    return constructKeyBound({
      start: [lower, MIN_LOWER_BOUNDS.date],
      end: [upper, MAX_UPPER_BOUND],
    });
  }

  function typeProcedure(type: SportType | undefined) {
    if (type) return dateProcedure(type, type);

    return dateProcedure(MIN_LOWER_BOUNDS.string, MAX_UPPER_BOUND);
  }

  if (Array.isArray(sportType))
    return sportType
      .map((type) => typeProcedure(type))
      .filter((v) => v !== undefined);

  return typeProcedure(sportType);
}

export async function getActivities(
  db: ActivityDatabase,
  selectionOptions?: ActivitySelectionOptions,
): Promise<SummaryActivity[]> {
  if (!selectionOptions) return db.getAll(ACTIVITY_STORE);

  const { sportType, startDate, endDate } = selectionOptions;

  const tx = db.transaction(ACTIVITY_STORE, "readonly");

  const store = tx.store;

  if (sportType && (startDate || endDate)) {
    const rangeSearch = constructSelectionOptionsKeyRange(selectionOptions);

    const index = store.index(INDEXES.TYPE_DATE);

    if (Array.isArray(rangeSearch))
      return Promise.all(rangeSearch.map((range) => index.getAll(range))).then(
        (results) => results.flat(),
      );

    return index.getAll(rangeSearch);
  } else if (sportType) {
    const rangeSearch = constructDiscreteKeyBound(sportType);

    const index = store.index(INDEXES.TYPE);

    return Promise.all(rangeSearch.map((range) => index.getAll(range))).then(
      (results) => results.flat(),
    );
  } else if (startDate || endDate) {
    const rangeSearch = constructKeyBound(
      startDate
        ? {
            start: startDate,
          }
        : {
            end: endDate,
          },
    );

    const index = store.index(INDEXES.DATE);

    return index.getAll(rangeSearch);
  }

  return store.getAll();
}
