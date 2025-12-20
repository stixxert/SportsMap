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
import { FilterDrawer } from "@/features/maps/components/activity-list/drawer";

export default function MapPage() {
  const isSynced = useActivitySyncStore((state) => state.activitiesSync);

  console.log("Is synced:", isSynced);

  const activities = useCurrentActivities();

  return (
    <div style={{ position: "absolute", height: "100%", width: "100%" }}>
      <Box
        sx={{
          position: "absolute",
          zIndex: 9999,
          right: 0,
          pointerEvents: "auto",
        }}
      >
        <FilterDrawer></FilterDrawer>
      </Box>
      <MapFrameComponent></MapFrameComponent>
    </div>
  );
}
