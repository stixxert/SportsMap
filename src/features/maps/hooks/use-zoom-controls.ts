"use client";

import React, { useEffect } from "react";
import L, { LeafletEvent } from "leaflet";
import { createGeolocationUpdateCallback } from "@/features/maps/lib/map-visuals";

function checkZoomBounds(map: L.Map) {
  const bounds = { min: false, max: false };

  const zoom = map.getZoom();

  if (zoom <= map.getMinZoom()) {
    bounds.min = true;
  } else if (zoom >= map.getMaxZoom()) {
    bounds.max = true;
  }

  return bounds;
}

export function useZoomControls(map: React.RefObject<L.Map | null>) {
  const [zoomInDisabled, setZoomInDisabled] = React.useState(false);
  const [zoomOutDisabled, setZoomOutDisabled] = React.useState(false);

  useEffect(() => {
    if (!map.current) return;

    const mapRef = map.current;

    function zoomEvent() {
      if (!mapRef) return;
      const bounds = checkZoomBounds(mapRef);

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

    mapRef.on("zoomend", zoomEvent);

    return () => {
      if (!mapRef) return;

      mapRef.off("zoomend", zoomEvent);
    };
  }, [map]);

  function zoomModify(modifier: number) {
    if (!map.current) return () => {};

    if (modifier < 0) {
      return () => {
        if (!map.current) return;

        map.current.zoomOut();

        const bounds = checkZoomBounds(map.current);

        if (bounds.min) {
          if (!zoomOutDisabled) setZoomOutDisabled(true);

          if (zoomInDisabled) setZoomInDisabled(false);
        }
      };
    } else if (modifier > 0) {
      return () => {
        if (!map.current) return;

        map.current.zoomIn();

        const bounds = checkZoomBounds(map.current);

        if (bounds.max) {
          if (!zoomInDisabled) setZoomInDisabled(true);

          if (zoomOutDisabled) setZoomOutDisabled(false);
        }
      };
    }

    return () => {};
  }

  return {
    zoomIn: zoomModify(1),
    zoomInDisabled,
    zoomOut: zoomModify(-1),
    zoomOutDisabled,
  };
}

export function useLocationDetection(map: React.RefObject<L.Map | null>) {
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
