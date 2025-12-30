import React, { JSX } from "react";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { Drawer, Tooltip, ButtonBase, Avatar, Stack } from "@mui/material";
import L from "leaflet";
import {
  useLocationDetection,
  useZoomControls,
} from "@/features/maps/hooks/use-zoom-controls";

type ViewButtonProps = {
  action: () => void;
  label: string;
  icon: JSX.Element;
  disabled: boolean;
};

function ViewButton({ action, label, icon, disabled }: ViewButtonProps) {
  return (
    <Tooltip title={label}>
      <ButtonBase onClick={action} disabled={disabled}>
        <Avatar
          sx={(theme) => ({
            borderRadius: "50%",
            backgroundColor: !disabled
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
            },
            "&:active": {
              backgroundColor: theme.palette.primary.dark,
            },
          })}
        >
          {icon}
        </Avatar>
      </ButtonBase>
    </Tooltip>
  );
}

export function ViewController({
  map,
}: {
  map: React.RefObject<L.Map | null>;
}) {
  const { zoomIn, zoomInDisabled, zoomOut, zoomOutDisabled } =
    useZoomControls(map);

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
