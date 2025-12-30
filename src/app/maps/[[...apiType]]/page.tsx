"use client";

import dynamic from "next/dynamic";

import Box from "@mui/material/Box";

const Map = dynamic(() => import("@/features/maps/components/Map"), {
  ssr: false,
});

const Overlay = dynamic(
  () => import("@/features/maps/components/overlay/Overlay"),
  {
    ssr: false,
  },
);

import {
  useActivitySyncStore,
  useCurrentActivities,
} from "@/features/activity/stores/activity-store";
import * as React from "react";
import { useRef } from "react";

export default function MapPage() {
  const isSynced = useActivitySyncStore((state) => state.activitiesSync);

  console.log("Is synced:", isSynced);

  const activities = useCurrentActivities();

  const mapRef = useRef<L.Map | null>(null);

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100%" }}>
      <Box sx={{ position: "absolute" }}>
        <Overlay map={mapRef}></Overlay>
      </Box>
      <Box sx={{ position: "relative", height: "100%" }}>
        <Map map={mapRef}></Map>
      </Box>
    </Box>
  );
}
