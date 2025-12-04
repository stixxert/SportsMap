import { useActivityDBStore } from "@stores/activity-store";
import { useEffect } from "react";
import { openActivityDB } from "@lib/activity-db";
import { useApiConfigurationStore } from "@features/authorization/api-configuration-store";

export function useStoredActivities() {
  const setActivityDB = useActivityDBStore((state) => state.setActivityDB);

  const apiType = useApiConfigurationStore((state) => state.apiType);

  async function openDBAndSetActivityDB() {
    const db = await openActivityDB(apiType);

    setActivityDB(db);

    return () => db.close();
  }

  useEffect(() => {
    openDBAndSetActivityDB().then();
  });
}
