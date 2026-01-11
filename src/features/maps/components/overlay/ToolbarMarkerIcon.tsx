import {
  BaseIconButton,
  IconButtonBaseProps,
} from "@/features/maps/components/BaseIconButton";

import RoomIcon from "@mui/icons-material/Room";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocationOffIcon from "@mui/icons-material/LocationOff";

import {
  Box,
  Stack,
  Slider,
  Tooltip,
  Collapse,
  List,
  ListItem,
} from "@mui/material";
import { useState } from "react";
import {
  PointInteraction,
  useMapInteractionStore,
  usePointSensitivityStore,
} from "@/features/maps/stores/map-interaction-store";

function useMapMarkerActive() {
  const mapInteractionType = useMapInteractionStore(
    (state) => state.interaction,
  );

  return mapInteractionType === "point";
}

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
          paddingRight: 3,
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
  const { isActive, setActive } = props;

  const markerActive = useMapMarkerActive();

  function removeMarker() {
    useMapInteractionStore
      .getState()
      .setInteractionState({ interaction: null, value: null });

    if (setActive && !isActive) {
      setActive(false);
    }
  }

  return markerActive ? (
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
  const { isActive, setActive } = props;

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
    setActive,
    label: "",
    icon: props.icon,
  };

  return (
    <Stack
      spacing={{ xs: 1 }}
      onMouseEnter={() => {
        setBoxHoverActive(true);
      }}
      onMouseLeave={() => {
        setBoxHoverActive(false);
      }}
    >
      <Box
        onMouseEnter={() => setPrimaryHoverActive(true)}
        onMouseLeave={() => setPrimaryHoverActive(false)}
      >
        <BaseIconButton
          {...props}
          secondaryColor={markerActive}
          label={primaryIconLabel}
          icon={primaryIcon}
        />
      </Box>
      {(isActive || boxHoverActive) && (
        <>
          <RemoveMarkerButton {...childrenProps} />
          <SensitivityAdjustSlider />
        </>
      )}
    </Stack>
  );
}
