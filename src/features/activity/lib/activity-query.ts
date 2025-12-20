import {
  getActivities,
  openActivityDB,
} from "@/features/activity/lib/activity-db";
import { ActivitiesCategoryParams } from "@/types/types";
import { ApiType } from "@/types/configuration-types";
import { SummaryActivity } from "@/strava-api";
import { useApiTypeStore } from "@/features/auth/stores/api-store";
import {
  useActivityCategoryParamStore,
  useActivityStore,
} from "@/features/activity/stores/activity-store";

export async function getActivitiesByCategory(
  apiType?: ApiType,
  categoryParams?: ActivitiesCategoryParams,
): Promise<SummaryActivity[]> {
  if (!apiType) {
    // TODO: Where to handle missing ApiType?
    return Promise.resolve([] as SummaryActivity[]);
  }

  const db = await openActivityDB(apiType);

  return getActivities(db, categoryParams);
}

export function activityDependenciesCallback() {
  const apiType = useApiTypeStore.getState().apiType;

  const categoryParams =
    useActivityCategoryParamStore.getState().categoryParams;

  const activities = getActivitiesByCategory(
    apiType || undefined,
    categoryParams,
  );

  useActivityStore.getState().setActivities(activities);
}
