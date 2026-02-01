import {
  ActivitySelectionOptions,
  getActivities,
} from "@/features/activity/lib/data/store-actions";
import { ApiType } from "@/types/configuration-types";
import { SummaryActivity } from "@/strava-api";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import {
  useActivityCategoryParamStore,
  useActivityStore,
  useActivitySyncStore,
} from "@/features/activity/stores/activity-store";
import { openActivityDatabase } from "@/lib/db/origin-related-activity-db";

export async function getActivitiesByCategory(
  apiType?: ApiType,
  categoryParams?: ActivitySelectionOptions,
): Promise<SummaryActivity[]> {
  if (!apiType) {
    // TODO: Where to handle missing ApiType?
    return Promise.resolve([] as SummaryActivity[]);
  }

  const db = await openActivityDatabase(apiType);

  return getActivities(db, categoryParams);
}

export async function activityDependenciesCallback() {
  if (!useActivitySyncStore.getState().activitiesSync) return;

  const apiType = useApiTypeStore.getState().apiType;

  const categoryParams =
    useActivityCategoryParamStore.getState().categoryParams;

  const activities = await getActivitiesByCategory(
    apiType || undefined,
    categoryParams,
  );

  useActivityStore.getState().setActivities(activities);
}
