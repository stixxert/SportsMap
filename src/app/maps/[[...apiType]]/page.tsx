"use client";

import dynamic from "next/dynamic";

import Box from "@mui/material/Box";
import * as React from "react";
import { useRef } from "react";
import L from "leaflet";
import { useAuthenticatedState } from "@/features/auth/hooks/authorization-hooks";
import { useApiType } from "@/features/auth/stores/api-store";
import { ApiType } from "@/types/configuration-types";
import { LoginDialog } from "@/features/profile/components/login-dialog";
import { usePrivacyNoticeState } from "@/features/profile/stores/privacy-notice";
import { PrivacyDialog } from "@/features/profile/components/privacy-dialog";

const Map = dynamic(() => import("@/features/maps/components/Map"), {
  ssr: false,
});

const Overlay = dynamic(
  () => import("@/features/maps/components/overlay/Overlay"),
  {
    ssr: false,
  },
);

export default function MapPage() {
  const mapRef = useRef<L.Map | null>(null);

  const isAuthenticated = useAuthenticatedState();

  const privacyDialog = usePrivacyNoticeState();

  const apiType = useApiType();

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100%" }}>
      <Box sx={{ position: "absolute" }}>
        <Overlay map={mapRef}></Overlay>
      </Box>
      <Box sx={{ position: "relative", height: "100%" }}>
        <Map map={mapRef}></Map>
      </Box>
      {apiType === ApiType.Strava &&
        isAuthenticated !== null &&
        !isAuthenticated && <LoginDialog open={!isAuthenticated} />}
      {privacyDialog && <PrivacyDialog />}
    </Box>
  );
}
