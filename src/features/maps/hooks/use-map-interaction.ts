"use client";

import { useEffect } from "react";
import {
  createMapPointClickUpdate,
  createMapViewUpdate,
  setMapBoundsAsView,
} from "@/features/maps/lib/map-view";
import { subscribeToPointInteractionUpdate } from "@/features/maps/lib/map-visuals";
import { useMap } from "@/features/maps/stores/map-store";

export function useMapInteraction() {
  const map = useMap();

  useEffect(() => {
    if (!map.current) return;

    setMapBoundsAsView(map.current);
  }, [map]);

  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    const pointUpdate = createMapPointClickUpdate(mapRef);
    const viewUpdate = createMapViewUpdate(mapRef);

    const unsubscribePointInteractionUpdate =
      subscribeToPointInteractionUpdate(mapRef);

    mapRef.on("click", pointUpdate);

    mapRef.on("moveend", viewUpdate);

    return () => {
      unsubscribePointInteractionUpdate();

      if (!mapRef) return;

      mapRef.off("moveend", viewUpdate);

      mapRef.off("click", pointUpdate);
    };
  }, [map]);
}
