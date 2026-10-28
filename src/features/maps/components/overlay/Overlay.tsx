import React, { useState } from "react";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { FunctionToolbar } from "@/features/maps/components/overlay/Toolbar";
import { OverlayDrawer } from "@/features/maps/components/overlay/OverlayDrawer";
import { ViewController } from "@/features/maps/components/View";
import { BottomMenu } from "@/features/maps/components/overlay/BottomMenu";

export const MENU_OPTIONS_FOR_DRAWER = ["list", "filter"] as const;

export type SelectionMenuTypes =
  | (typeof MENU_OPTIONS_FOR_DRAWER)[number]
  | "marker"
  | "user";

export function selectedContains(
  selected: SelectionMenuTypes[] | null,
  contains: SelectionMenuTypes,
) {
  return selected ? selected.find((s) => s === contains) !== undefined : false;
}

export function updateSelected(
  selected: SelectionMenuTypes[] | null,
  newSelected: SelectionMenuTypes,
) {
  let updatedSelected = selected ? selected.slice() : [];

  if (
    drawerVisible(selected) &&
    MENU_OPTIONS_FOR_DRAWER.find((v) => v === newSelected)
  ) {
    for (const drawerOption of MENU_OPTIONS_FOR_DRAWER) {
      if (selectedContains(selected, drawerOption)) {
        updatedSelected = updatedSelected.filter(
          (option) => option !== drawerOption,
        );
      }
    }
  }

  return [...updatedSelected, newSelected];
}

export function drawerVisible(selected: SelectionMenuTypes[] | null) {
  if (selected === null) return false;

  for (const drawerOption of MENU_OPTIONS_FOR_DRAWER) {
    if (selectedContains(selected, drawerOption)) return true;
  }

  return false;
}

export function useDrawerOpenWidth(selected: SelectionMenuTypes[] | null) {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (selectedContains(selected, "list")) {
    if (isSmallScreen) return "25vw";
    return "40vw";
  } else if (selectedContains(selected, "filter")) {
    return "25vw";
  }

  return "0";
}

export default function Overlay() {
  const [selected, setSelected] = useState<SelectionMenuTypes[] | null>(null);

  function viewControllerIsVisible() {
    return !drawerVisible(selected);
  }

  return (
    <>
      <Box
        sx={(theme) => ({
          left: 0,
          [theme.breakpoints.down("md")]: {
            display: viewControllerIsVisible() ? "block" : "none",
          },
        })}
      >
        <ViewController />
      </Box>

      <OverlayDrawer selected={selected} />
      <FunctionToolbar selected={selected} setSelected={setSelected} />

      <Box sx={{ left: 0, bottom: 0 }}>
        <BottomMenu />
      </Box>
    </>
  );
}
