"use client";

import dynamic from "next/dynamic";

const MapFrameComponent = dynamic(
  () => import("@features/maps/components/MapFrameComponent"),
  {
    ssr: false,
  },
);
import { useActivitySyncStore } from "@features/activity/stores/activity-store";

export default function MapPage() {
  const isSynced = useActivitySyncStore((state) => state.activitiesSync);

  console.log("Is synced:", isSynced);

  return (
    <>
      <MapFrameComponent></MapFrameComponent>
    </>
  );
}
