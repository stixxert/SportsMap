"use client";

import { useConfigurationContext } from "@/src/contexts/APIConfigurationContext";
import { ActivitiesApi } from "@/strava-api";
import MapFrameComponent from "@/src/app/maps/components/MapFrameComponent";

export default function MapPage() {
  const conf = useConfigurationContext();

  const activitiesApi = new ActivitiesApi(conf);

  async function getActivities() {
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
