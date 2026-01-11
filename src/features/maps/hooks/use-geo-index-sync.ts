import { useEffect } from "react";
import { subscribeToActivityStateUpdate } from "@/features/maps/stores/geospatial-store";

export function useGeoIndexSync() {
  useEffect(() => {
    const unsubscribe = subscribeToActivityStateUpdate();

    return () => unsubscribe();
  });
}
