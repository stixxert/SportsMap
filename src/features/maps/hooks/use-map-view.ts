import { useEffect, useMemo, useRef } from "react";
import {
  activitiesToGeoJSON,
  createActivityVectorGrid,
} from "@/features/maps/lib/draw-activities";
import { useMap } from "@/features/maps/stores/map-store";
import L from "leaflet";
import { useCurrentActivities } from "@/features/activity/stores/activity-store";
import { useProfile } from "@/features/profile/hooks/use-profile";

import useSWRImmutable from "swr/immutable";
import { fetchLocation } from "@/features/maps/lib/profile-location";
import { setMapBoundsAsView } from "@/features/maps/lib/map-view";
import { useSpatialIndexReadinessStore } from "@/features/maps/lib/spatial/dispatch-worker";

/* Timing issue; start(or any?) index update does not update map */
export function useInitialMapView() {
  const map = useMap();
  const initialPlacementDone = useRef(false);

  const viewReady = useAthleteLocationAsSpawnView();

  const spatialIndexReady = useSpatialIndexReadinessStore(
    (state) => state.ready,
  );

  useEffect(() => {
    if (initialPlacementDone.current) return;

    if (!map.current) return;

    if (!spatialIndexReady) return;

    if (!viewReady) return;

    setMapBoundsAsView(map.current);
    initialPlacementDone.current = true;
  }, [map, spatialIndexReady, viewReady]);
}

export function useActivitiesOnMap() {
  const map = useMap();

  const activityLayer = useRef<L.VectorGrid | null>(null);

  const activities = useCurrentActivities();

  useEffect(() => {
    if (!map.current) return;

    const geojson = activitiesToGeoJSON(activities);
    if (activityLayer.current) {
      activityLayer.current.remove();
    }

    if (!geojson) return;

    const layer = createActivityVectorGrid(map.current, geojson);

    if (!layer) return;

    activityLayer.current = layer;

    return () => {
      if (activityLayer.current) activityLayer.current.remove();
    };
  }, [activities, map]);
}

/* true: map ready. false; not */
export function useAthleteLocationAsSpawnView() {
  const hasPlacedSpawnView = useRef(false);

  const map = useMap();

  const { user, error: profileError, profileUsable } = useProfile();

  const dependenciesReady = user && !profileError;

  const searchKey = useMemo(() => {
    if (!dependenciesReady) return null;

    const { city, state, country } = user;

    if (!(city || state || country)) return null;

    return { city: city, county: state, country: country };
  }, [user, dependenciesReady]);

  const { data, error, isLoading } = useSWRImmutable(searchKey, fetchLocation);

  useEffect(() => {
    if (!data || error) return;

    if (!map.current) return;

    if (hasPlacedSpawnView.current) return;

    hasPlacedSpawnView.current = true;

    map.current.fitBounds(data);
  }, [map, data, error]);

  /* dependencies ready, no search key means no location in user profile */
  if (dependenciesReady) {
    if (searchKey === null) return true;

    return !isLoading;
  } else if (!profileUsable) return true;

  return false;
}
