import React, { useEffect } from "react";
import L from "leaflet";
import {
  createMapPointClickUpdate,
  createMapViewUpdate,
  setMapBoundsAsView,
} from "@/features/maps/lib/map-view";
import { createSelectionPointUpdate } from "@/features/maps/lib/map-visuals";

function createPointUpdateEvent(map: L.Map) {
  const viewUpdate = createMapPointClickUpdate(map);
  const visualUpdate = createSelectionPointUpdate(map);

  return (event: L.LeafletMouseEvent) => {
    [viewUpdate, visualUpdate].forEach((callback) => callback(event));
  };
}

export function useMapInteraction(map: React.RefObject<L.Map | null>) {
  useEffect(() => {
    if (!map.current) return;

    setMapBoundsAsView(map.current);
  }, [map]);

  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    const pointUpdate = createPointUpdateEvent(mapRef);
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
