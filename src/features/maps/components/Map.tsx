"use client";

import "leaflet/dist/leaflet.css";

import * as React from "react";
import { useMapInteraction } from "@/features/maps/hooks/use-map-interaction";

import { useMapInstance } from "@/features/maps/hooks/use-map-instance";
import { useAthleteLocationAsSpawnView } from "@/features/maps/hooks/use-map-view";

export default function Map() {
  const mapRef = useMapInstance();

  useMapInteraction();

  const locationSpawnReady = useAthleteLocationAsSpawnView();

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
