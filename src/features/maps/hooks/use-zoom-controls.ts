"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { Map } from "leaflet";
import { createGeolocationUpdateCallback } from "@/features/maps/lib/map-visuals";
import { getMap, useMap } from "@/features/maps/stores/map-store";

function checkZoomBounds(map: Map) {
  const bounds = { min: false, max: false };

  const zoom = map.getZoom();

  if (zoom <= map.getMinZoom()) {
    bounds.min = true;
  } else if (zoom >= map.getMaxZoom()) {
    bounds.max = true;
  }

  return bounds;
}

function useZoomDisable() {
  const map = useMap();

  const [zoomInDisabled, setZoomInDisabled] = React.useState(false);
  const [zoomOutDisabled, setZoomOutDisabled] = React.useState(false);

  function checkZoomState() {
    if (!map.current) return;
    const bounds = checkZoomBounds(map.current);

    if (bounds.min) {
      setZoomOutDisabled(true);

      setZoomInDisabled(false);
    } else {
      setZoomOutDisabled(false);
    }

    if (bounds.max) {
      setZoomInDisabled(true);

      setZoomOutDisabled(false);
    } else {
      setZoomInDisabled(false);
    }
  }

  return {
    zoomInDisabled,
    zoomOutDisabled,
    checkZoomState,
  };
}

function useZoomControls() {
  const map = useMap();

  const { zoomInDisabled, zoomOutDisabled, checkZoomState } = useZoomDisable();

  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    mapRef.on("zoomend", checkZoomState);

    return () => {
      if (!mapRef) return;

      mapRef.off("zoomend", checkZoomState);
    };
  }, [checkZoomState, map]);

  function zoomIn() {
    if (!map.current) return;

    map.current.zoomIn();

    checkZoomState();
  }

  function zoomOut() {
    if (!map.current) return;

    map.current.zoomOut();

    checkZoomState();
  }

  return {
    zoomIn,
    zoomInDisabled,
    zoomOut,
    zoomOutDisabled,
  };
}

export default useZoomControls;

export function useLocationDetection(map: React.RefObject<Map | null>) {
  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    const locationFound = createGeolocationUpdateCallback(mapRef);
    mapRef.on("locationfound", locationFound);

    return () => {
      mapRef.off("locationfound", locationFound);
    };
  });

  return () => {
    if (!map.current) return;
    map.current.locate({ setView: true, maxZoom: 14 });
  };
}
