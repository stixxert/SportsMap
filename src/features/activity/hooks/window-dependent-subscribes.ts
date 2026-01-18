"use client";

import { useEffect } from "react";
import { activityDependenciesCallback } from "@/features/activity/lib/data/activity-query";
import {
  useActivityCategoryParamStore,
  useActivitySyncStore,
} from "@/features/activity/stores/activity-store";

export function useActivityCategorizationQuerySync() {
  useEffect(() => {
    const unsubscribeCategoryParams = useActivityCategoryParamStore.subscribe(
      () => activityDependenciesCallback(),
    );

    const unsubscribeActivitySync = useActivitySyncStore.subscribe(() =>
      activityDependenciesCallback(),
    );

    return () => {
      unsubscribeActivitySync();
      unsubscribeCategoryParams();
    };
  }, []);

  /* TODO: Is this the best way of ensuring that activities are available at page load? */
  useEffect(() => {
    useActivityCategoryParamStore.getState().setCategoryParams({});
  }, []);
}
