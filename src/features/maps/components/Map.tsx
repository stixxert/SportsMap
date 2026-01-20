"use client";

import { useEffect, useRef } from "react";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import "leaflet.heat";
import * as React from "react";
import {
  useInteractionDependencies,
  useMapInteraction,
} from "@/features/maps/hooks/use-map-interaction";
import { getMap, setMapCurrent } from "@/features/maps/stores/map-store";
import {
  useActivitiesOnMap,
  useAthleteLocationAsSpawnView,
} from "@/features/maps/hooks/use-map-view";
import { ZOOM_BOUNDS } from "@/config/map";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useMapInteraction();

  useInteractionDependencies();

  useActivitiesOnMap();

  const locationSpawnReady = useAthleteLocationAsSpawnView();

  useEffect(() => {
    const map = getMap();

    if (map.current) return;

    if (!mapRef.current) return;

    setMapCurrent(
      L.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
        minZoom: ZOOM_BOUNDS.min,
        maxZoom: ZOOM_BOUNDS.max,
        zoomControl: false,
        worldCopyJump: true,
      }),
    );

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current!);
  }, []);

  return (
    <div
      id={"map"}
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        // suspend visible map until a possible starting view is available (or not)
        visibility: locationSpawnReady ? "visible" : "hidden",
      }}
    ></div>
  );
}
