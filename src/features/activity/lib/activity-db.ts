"use client";

import { SummaryActivity } from "@/strava-api";
import { DBSchema, deleteDB, IDBPDatabase, openDB } from "idb";
import { ApiType } from "@/types/configuration-types";
import { ActivitiesCategoryParams } from "@/types/types";
import { constructDiscreteKeyBound, constructKeyBound } from "@/utils/misc";
import { del } from "@/lib/kv-db";

export const DATABASE_NAME = "sports_db";
export const ACTIVITY_STORE_NAME = "activities";

export const INDEX_ID = "by-id";
export const INDEX_TYPE = "by-type";
export const INDEX_DATE = "by-date";

interface ActivityDBSchema extends DBSchema {
  activities: {
    value: {
      [K in keyof SummaryActivity]?: SummaryActivity[K];
    };
    key: string;
    indexes: { "by-id": string; "by-type": string; "by-date": Date };
  };
}

function getDbName(apiType: ApiType) {
  return `${DATABASE_NAME}_${apiType}`;
}

export type ActivityDb = IDBPDatabase<ActivityDBSchema>;

export async function openActivityDB(
  activityConfigurationType: ApiType,
): Promise<ActivityDb> {
  return openDB<ActivityDBSchema>(getDbName(activityConfigurationType), 1, {
    upgrade(db) {
      const activitiesStore = db.createObjectStore(ACTIVITY_STORE_NAME, {
        keyPath: "id",
      });

      activitiesStore.createIndex(INDEX_ID, "id", { unique: true });
      activitiesStore.createIndex(INDEX_TYPE, "type", { unique: false });
      activitiesStore.createIndex(INDEX_DATE, "startDate", { unique: false });
    },
  });
}

export async function addActivities(
  db: ActivityDb,
  activities: SummaryActivity[],
): Promise<void> {
  const tx = db.transaction(ACTIVITY_STORE_NAME, "readwrite");

  const addActivitiesPromises = activities.map(async (activity) => {
    await tx.store.add(activity);
  });

  await Promise.all([...addActivitiesPromises, tx.done]);
}

export async function getActivities(
  db: ActivityDb,
  categoryParams?: ActivitiesCategoryParams,
): Promise<SummaryActivity[]> {
  const dateRange = constructKeyBound({
    start: categoryParams?.startTime,
    end: categoryParams?.endTime,
  });

  const sportTypeRange = categoryParams?.sportType
    ? constructDiscreteKeyBound(categoryParams.sportType)
    : undefined;

  let dateBoundActivitiesPromise: Promise<SummaryActivity[]> = Promise.resolve(
    [] as SummaryActivity[],
  );
  let typeBoundActivitiesPromise: Promise<SummaryActivity[]> = Promise.resolve(
    [] as SummaryActivity[],
  );

  if (!dateRange || !sportTypeRange) {
    return db
      .getAllFromIndex(ACTIVITY_STORE_NAME, INDEX_DATE)
      .then((activities) => activities.reverse());
  }

  if (dateRange) {
    dateBoundActivitiesPromise = db.getAllFromIndex(
      ACTIVITY_STORE_NAME,
      INDEX_DATE,
      dateRange,
    );
  }

  if (sportTypeRange) {
    typeBoundActivitiesPromise = Promise.all(
      sportTypeRange.map(async (type) => {
        return db
          .getAllFromIndex(ACTIVITY_STORE_NAME, INDEX_TYPE, type)
          .then((activities) => activities.reverse());
      }),
    ).then((typeActivities) => typeActivities.flat());
  }

  const [dateBoundActivities, typeBoundActivities] = await Promise.all([
    dateBoundActivitiesPromise.then((activities) => activities.reverse()),
    typeBoundActivitiesPromise,
  ]);

  // return one of the category responses, if only one were used
  if (dateRange && !sportTypeRange) return dateBoundActivities;

  if (sportTypeRange && !dateRange) return typeBoundActivities;

  // choose one filter as outer iterator, one or the other might be better in practise
  return dateBoundActivities.filter((dateActivity) => {
    return typeBoundActivities.some(
      (typeActivity) => dateActivity.id === typeActivity.id,
    );
  });
}

export async function deleteActivityDb(apiType: ApiType): Promise<void> {
  await deleteDB(getDbName(apiType));
}

export async function deleteActivityDbs(): Promise<void> {
  await Promise.all(
    [ApiType.Strava, ApiType.Demo].map((type) => deleteActivityDb(type)),
  );
}

export function deleteAllActivities() {
  return deleteActivityDbs();
}
