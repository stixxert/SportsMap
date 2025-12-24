import React, { useLayoutEffect } from "react";
import L from "leaflet";
import {
  createMapPointClickUpdate,
  createMapViewUpdate,
  setMapBoundsAsView,
} from "@/features/maps/lib/map-view";

export function useMapInteraction(map: React.RefObject<L.Map | null>) {
  useLayoutEffect(() => {
    if (!map.current) return;

    setMapBoundsAsView(map.current);
  }, [map]);

  useLayoutEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    const pointUpdate = createMapPointClickUpdate();
    const viewUpdate = createMapViewUpdate(mapRef);
    mapRef.on("click", pointUpdate);

    mapRef.on("moveend", viewUpdate);
    return () => {
      if (!mapRef) return;

      mapRef.off("moveend", viewUpdate);

      mapRef.off("click", pointUpdate);
    };
  }, [map]);
}
