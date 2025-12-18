import { useEffect } from "react";
import { useApiTypeStore } from "@features/auth/stores/api-store";
import {
  exportMetaData,
  importMetaData,
} from "@features/activity/lib/activity-metadata";
import { useActivityMetadataStore } from "@features/activity/stores/activity-metadata-store";
import { activityDependenciesCallback } from "@features/activity/lib/activity-query";
import {
  useActivityCategoryParamStore,
  useActivitySyncStore,
} from "@features/activity/stores/activity-store";

export function useMetaDataSync() {
  useEffect(() => {
    const unsubscribeFromApiType = useApiTypeStore.subscribe(
      ({ apiType: newApiType }, { apiType: prevApiType }) => {
        setTimeout(() => importMetaData(newApiType, prevApiType));
      },
    );

    const unsubscribeFromMetaData = useActivityMetadataStore.subscribe(
      (
        { apiType: newApiType, metaData: newMetaData },
        { apiType: prevApiType, metaData: prevMetaData },
      ) => {
        setTimeout(() =>
          exportMetaData(newApiType, newMetaData, prevApiType, prevMetaData),
        );
      },
    );

    return () => {
      unsubscribeFromMetaData();
      unsubscribeFromApiType();
    };
  }, []);

  /* TODO: Is this the best way of ensuring that activities are available at page load? */
  useEffect(() => {
    const apiType = useApiTypeStore.getState().apiType;
    setTimeout(() => importMetaData(apiType, null));
  }, []);
}

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
