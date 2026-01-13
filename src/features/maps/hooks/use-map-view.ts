import { useEffect, useRef } from "react";
import { activitytogeojson, tile } from "@/features/maps/lib/points-utils";
import { useMap } from "@/features/maps/stores/map-store";
import L from "leaflet";
import { useCurrentActivities } from "@/features/activity/stores/activity-store";
import { useProfile } from "@/features/profile/hooks/use-profile";

import useSWRImmutable from "swr/immutable";
import { fetchLocation } from "@/features/maps/lib/location-search";

export function useActivitiesOnMap() {
  const map = useMap();

  const activityLayer = useRef<L.VectorGrid | null>(null);

  const activities = useCurrentActivities();

  useEffect(() => {
    if (!map.current) return;

    function doStuff() {
      const geojson = activitytogeojson(activities);
      if (activityLayer.current) {
        activityLayer.current.remove();
      }

      activityLayer.current = tile(map.current!, geojson);
    }

    doStuff();

    return () => {
      if (activityLayer.current) activityLayer.current.remove();
    };
  }, [activities, map]);
}

/* true: map ready. false; not */
export function useAthleteLocationAsSpawnView() {
  const hasPlacedSpawnView = useRef(false);

  const map = useMap();

  const profile = useProfile();

  function dependenciesReady() {
    const { user, error } = profile;

    return user && !error;
  }

  function getSearchKey() {
    if (!dependenciesReady()) return;

    const { user } = profile;

    if (!(user.city || user.state || user.country)) return null;

    return [user.city, user.state, user.country];
  }

  const { data, error, isLoading } = useSWRImmutable(
    getSearchKey(),
    ([city, state, country]) => fetchLocation(city, state, country),
  );

  useEffect(() => {
    if (!data || error) return;

    if (!map.current) return;

    if (hasPlacedSpawnView.current) return;

    hasPlacedSpawnView.current = true;

    map.current.fitBounds(data);
  }, [map, data, error]);

  /* dependencies ready, no search key means no location in user profile */
  if (dependenciesReady()) {
    if (getSearchKey() === null) return true;

    return !isLoading;
  }
  return false;
}
