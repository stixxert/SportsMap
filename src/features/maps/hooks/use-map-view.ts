import { useEffect, useRef } from "react";
import { activitytogeojson, tile } from "@/features/maps/lib/points-utils";
import { useMap } from "@/features/maps/stores/map-store";
import L from "leaflet";
import { useCurrentActivities } from "@/features/activity/stores/activity-store";

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
