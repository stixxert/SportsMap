"use client";

import dynamic from "next/dynamic";

import Box from "@mui/material/Box";
import * as React from "react";
import {
  useAccessTokenSync,
  useAuthenticatedState,
  useSyncApiTypeToParams,
} from "@/features/auth/hooks/authorization-hooks";
import { useApiType } from "@/features/auth/stores/api-store";
import { ApiType } from "@/types/configuration-types";
import { LoginDialog } from "@/features/profile/components/login-dialog";
import { usePrivacyNoticeState } from "@/features/profile/stores/privacy-notice";
import { PrivacyDialog } from "@/features/profile/components/privacy-dialog";
import {
  useActivityCategorizationQuerySync,
  useMetaDataSync,
} from "@/features/activity/hooks/window-dependent-subscribes";
import { useActivitySynchronization } from "@/features/activity/hooks/sync-state";
import { useGeoIndexSync } from "@/features/maps/hooks/use-geo-index-sync";

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
  useMetaDataSync();
  useAccessTokenSync();
  useActivityCategorizationQuerySync();
  useSyncApiTypeToParams();

  useGeoIndexSync();

  useActivitySynchronization();

  const isAuthenticated = useAuthenticatedState();

  const privacyDialog = usePrivacyNoticeState();

  const apiType = useApiType();

  return (
    <Box sx={{ position: "relative", height: "100vh", width: "100%" }}>
      <Box sx={{ position: "absolute" }}>
        <Overlay></Overlay>
      </Box>
      <Box sx={{ position: "relative", height: "100%" }}>
        <Map></Map>
      </Box>
      {apiType === ApiType.Strava &&
        isAuthenticated !== null &&
        !isAuthenticated && <LoginDialog open={!isAuthenticated} />}
      {privacyDialog && <PrivacyDialog />}
    </Box>
  );
}
