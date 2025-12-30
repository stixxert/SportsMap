"use client";

import React, { useEffect } from "react";
import L from "leaflet";
import {
  createMapPointClickUpdate,
  createMapViewUpdate,
  setMapBoundsAsView,
} from "@/features/maps/lib/map-view";
import { subscribeToPointInteractionUpdate } from "@/features/maps/lib/map-visuals";
import { subscribeToActivityStateUpdate } from "@/features/maps/stores/geospatial-store";
import {
  subscribeToIndexStateUpdate,
  subscribeToMapInteractionStateUpdate,
} from "@/features/maps/stores/activity-interaction-view-store";

export function useMapInteraction(map: React.RefObject<L.Map | null>) {
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

export function useInteractionDependencies() {
  useEffect(() => {
    const unsubscribeActivityStateUpdate = subscribeToActivityStateUpdate();

    const unsubscribeMapInteraction = subscribeToMapInteractionStateUpdate();

    const unsubscribeToIndexStateUpdate = subscribeToIndexStateUpdate();

    return () => {
      unsubscribeToIndexStateUpdate();
      unsubscribeMapInteraction();
      unsubscribeActivityStateUpdate();
    };
  }, []);
}
