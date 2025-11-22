"use client";

import { ActivitiesApi } from "@/strava-api";
import MapFrameComponent from "@features/maps/components/MapFrameComponent";
import { useApiConfigurationStore } from "@features/authorization/api-configuration-store";

export default function MapPage() {
  const configuration = useApiConfigurationStore(
    (state) => state.configuration,
  );

  const activitiesApi = configuration ? new ActivitiesApi(configuration) : null;

  async function getActivities() {
    if (!activitiesApi) {
      return;
    }
    try {
      const activities = await activitiesApi.getLoggedInAthleteActivities();

      console.log(activities);
    } catch (error) {
      console.log("Caught err");
    }
  }

  getActivities();

  return (
    <>
      <MapFrameComponent></MapFrameComponent>
    </>
  );
}
