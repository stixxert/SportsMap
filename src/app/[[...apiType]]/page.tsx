"use client";

import dynamic from "next/dynamic";

import Box from "@mui/material/Box";
import * as React from "react";
import { useAuthenticatedState } from "@/lib/auth/authenticate";
import { useApiType } from "@/lib/auth/api-store";
import { MapLoginDialog } from "@/features/maps/components/map-login-dialog";
import { usePrivacyNoticeState } from "@/components/privacy-notice/privacy-notice";
import { PrivacyDialog } from "@/components/privacy-notice/privacy-dialog";
import { useActivitySyncStore } from "@/lib/activity/sync-state";
import { useActivityMetadataStore } from "@/features/activity/stores/activity-metadata-store";
import { ApiType } from "@/lib/auth/api-types";

const Map = dynamic(() => import("@/features/maps/components/Map"), {
  ssr: false,
});

const Overlay = dynamic(
  () => import("@/features/maps/components/overlay/Overlay"),
  {
    ssr: false,
  },
);

const MapDependenciesWrapper = dynamic(
  () => import("@/features/maps/components/MapDependenciesWrapper"),
  {
    ssr: false,
  },
);

export default function MapPage() {
  useActivitySyncStore((state) => state.activitiesSync);

  useActivityMetadataStore((state) => state.metaData);

  const isAuthenticated = useAuthenticatedState();

  const privacyDialog = usePrivacyNoticeState();

  const apiType = useApiType();

  return (
    <MapDependenciesWrapper>
      <Box sx={{ position: "relative", height: "100vh", width: "100%" }}>
        <Box sx={{ position: "absolute" }}>
          <Overlay></Overlay>
        </Box>
        <Box sx={{ position: "relative", height: "100%" }}>
          <Map></Map>
        </Box>
        {apiType === ApiType.Strava &&
          isAuthenticated !== null &&
          !isAuthenticated && <MapLoginDialog open={!isAuthenticated} />}
        {privacyDialog && <PrivacyDialog />}
      </Box>
    </MapDependenciesWrapper>
  );
}
