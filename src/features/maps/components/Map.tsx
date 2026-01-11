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
import { useGeoIndexSync } from "@/features/maps/hooks/use-geo-index-sync";
import { getMap, setMapCurrent } from "@/features/maps/stores/map-store";
import { useActivitiesOnMap } from "@/features/maps/hooks/use-map-view";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useGeoIndexSync();

  useMapInteraction();

  useInteractionDependencies();

  useActivitiesOnMap();

  useEffect(() => {
    const map = getMap();

    if (map.current) return;

    if (!mapRef.current) return;

    setMapCurrent(
      L.map(mapRef.current, {
        center: [0, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 15,
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
      style={{ height: "100%", width: "100%" }}
    ></div>
  );
}
