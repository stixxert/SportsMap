"use client";

import { ActivitiesApi } from "@/strava-api";
import MapFrameComponent from "@features/maps/components/MapFrameComponent";
import { useApiConfigurationStore } from "@features/authorization/api-configuration-store";
import { useActivityDBStore } from "@stores/activity-store";
import { ACTIVITY_STORE_NAME, addActivities, INDEX_ID } from "@lib/activity-db";
import { useEffect } from "react";
import { decode } from "@googlemaps/polyline-codec";

export default function MapPage() {
  const configuration = useApiConfigurationStore(
    (state) => state.configuration,
  );

  return (
    <>
      <MapFrameComponent></MapFrameComponent>
    </>
  );
}
