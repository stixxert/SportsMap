"use client";

import dynamic from "next/dynamic";

import Box from "@mui/material/Box";

const MapFrameComponent = dynamic(
  () => import("@/features/maps/components/MapFrameComponent"),
  {
    ssr: false,
  },
);
import {
  useActivitySyncStore,
  useCurrentActivities,
} from "@/features/activity/stores/activity-store";
import * as React from "react";
import { ViewDrawer } from "@/features/maps/components/activity-list/drawer";

export default function MapPage() {
  const isSynced = useActivitySyncStore((state) => state.activitiesSync);

  console.log("Is synced:", isSynced);

  const activities = useCurrentActivities();

  /*


        <Box
        sx={{
          position: "absolute",
          right: 0,
          pointerEvents: "auto",
        }}
      >
        <ViewDrawer></ViewDrawer>
      </Box>
   */
  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100%" }}>
      <Box sx={{ position: "absolute", right: 0, zIndex: 9999 }}>
        <ViewDrawer></ViewDrawer>
      </Box>
      <Box sx={{ position: "relative", height: "100%" }}>
        <MapFrameComponent></MapFrameComponent>
      </Box>
    </Box>
  );
}
