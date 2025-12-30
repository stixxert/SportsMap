import {
  BaseIconButton,
  IconButtonBaseProps,
} from "@/features/maps/components/BaseIconButton";

import RoomIcon from "@mui/icons-material/Room";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocationOffIcon from "@mui/icons-material/LocationOff";

import { Box, Stack, Slider, Tooltip } from "@mui/material";
import { useState } from "react";
import {
  PointInteraction,
  useMapInteractionStore,
  usePointSensitivityStore,
} from "@/features/maps/stores/map-interaction-store";

function sliderScale(scaleValue: number) {
  return 2 ** scaleValue;
}

function SensitivityAdjustSlider() {
  const setSensitivity = usePointSensitivityStore(
    (state) => state.setPointSensitivity,
  );
  const sensitivity = usePointSensitivityStore(
    (state) => state.pointSensitivity,
  );

  function forceSearchRefresh() {
    /* easiest way to force search to update */
    if (useMapInteractionStore.getState().interaction === "point") {
      useMapInteractionStore
        .getState()
        .setPointInteraction(
          useMapInteractionStore.getState().value as PointInteraction,
        );
    }
  }

  function handleChange(_: Event, newValue: number | number[]) {
    setSensitivity(Array.isArray(newValue) ? newValue[0] : newValue);
  }

  return (
    <Tooltip title={"Adjust search marker sensitivity"}>
      <Slider
        sx={(theme) => ({
          [theme.breakpoints.down("sm")]: {
            height: "20vh",
          },
          [theme.breakpoints.up("sm")]: {
            height: "10vh",
          },
        })}
        orientation="vertical"
        min={1}
        max={1000}
        step={10}
        scale={sliderScale}
        onChange={handleChange}
        onChangeCommitted={forceSearchRefresh}
        defaultValue={sensitivity}
        value={sensitivity}
      />
    </Tooltip>
  );
}

function RemoveMarkerButton(props: IconButtonBaseProps) {
  const mapInteractionType = useMapInteractionStore(
    (state) => state.interaction,
  );

  const { isActive, setActive } = props;

  const active = mapInteractionType === "point";

  function removeMarker() {
    useMapInteractionStore
      .getState()
      .setInteractionState({ interaction: null, value: null });

    if (setActive && !isActive) {
      setActive(false);
    }
  }

  return active ? (
    <BaseIconButton
      {...props}
      label={"Remove map marker"}
      icon={<LocationOffIcon />}
      setActive={removeMarker}
    />
  ) : (
    <></>
  );
}

export function ToolbarMarkerIcon(props: IconButtonBaseProps) {
  const { isActive } = props;

  const interactionType = useMapInteractionStore((state) => state.interaction);

  const markerActive = interactionType === "point";

  const [boxHoverActive, setBoxHoverActive] = useState(false);

  const [primaryHoverActive, setPrimaryHoverActive] = useState(false);
  const primaryIcon =
    isActive || boxHoverActive ? (
      isActive && primaryHoverActive ? (
        <KeyboardArrowUpIcon />
      ) : (
        <KeyboardArrowDownIcon />
      )
    ) : (
      <RoomIcon />
    );

  const primaryIconLabel = isActive
    ? primaryHoverActive
      ? "Close marker options"
      : ""
    : "Open marker options";

  const childrenProps: IconButtonBaseProps = {
    setActive: props.setActive,
    label: "",
    icon: props.icon,
  };

  return (
    <Box
      onMouseEnter={() => {
        setBoxHoverActive(true);
      }}
      onMouseLeave={() => {
        setBoxHoverActive(false);
      }}
    >
      {isActive || boxHoverActive ? (
        <Stack direction={"column"} spacing={{ xs: 1 }} alignItems={"center"}>
          <Box
            onMouseEnter={() => setPrimaryHoverActive(true)}
            onMouseLeave={() => setPrimaryHoverActive(false)}
          >
            <BaseIconButton
              {...props}
              label={primaryIconLabel}
              icon={primaryIcon}
            />
          </Box>
          <RemoveMarkerButton {...childrenProps} />
          <SensitivityAdjustSlider />
        </Stack>
      ) : (
        <BaseIconButton
          {...props}
          secondaryColor={markerActive}
          icon={<RoomIcon />}
        />
      )}
    </Box>
  );
}
