import React, { JSX } from "react";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { Drawer, Stack } from "@mui/material";
import useZoomControls, {
  useLocationDetection,
} from "@/features/maps/hooks/use-zoom-controls";
import { BaseIconButton } from "@/features/maps/components/BaseIconButton";
import { useMap } from "@/features/maps/stores/map-store";

type ViewButtonProps = {
  action: () => void;
  label: string;
  icon: JSX.Element;
  disabled: boolean;
};

function ViewButton({ action, label, icon, disabled }: ViewButtonProps) {
  return (
    <BaseIconButton
      setActive={action}
      icon={icon}
      label={label}
      disabled={disabled}
    />
  );
}

export function ViewController() {
  const map = useMap();

  const { zoomIn, zoomInDisabled, zoomOut, zoomOutDisabled } =
    useZoomControls();

  const locateFn = useLocationDetection(map);

  return (
    <Drawer
      variant={"permanent"}
      anchor={"left"}
      sx={{
        width: 64,
        flexShrink: 0,
        display: "flex",
        "& .MuiDrawer-paper": {
          width: 64,
          top: 0,
          border: "none",
          backgroundColor: "transparent",
          paddingTop: 2,
        },
      }}
    >
      <Stack
        direction={"column"}
        spacing={{ xs: 1 }}
        alignItems={"center"}
        sx={{ pointerEvents: "auto" }}
      >
        <ViewButton
          key={"location"}
          action={locateFn}
          label={"Use location"}
          icon={<MyLocationIcon />}
          disabled={false}
        />
        <ViewButton
          key={"zoomIn"}
          action={zoomIn}
          label={"Zoom in"}
          icon={<ZoomInIcon />}
          disabled={zoomInDisabled}
        />
        <ViewButton
          key={"zoomOut"}
          action={zoomOut}
          label={"Zoom out"}
          icon={<ZoomOutIcon />}
          disabled={zoomOutDisabled}
        />
      </Stack>
    </Drawer>
  );
}
